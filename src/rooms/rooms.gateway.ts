import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  SubscribeMessage,
} from '@nestjs/websockets';
import { WebSocket, Server } from 'ws';
import Redis from 'ioredis';
import * as url from 'url';
import { v4 as uuidv4 } from 'uuid';
import { ServerMsgCode, ServerMsg } from './protocol/ServerMsg';
import { JwtService } from '@nestjs/jwt';

interface RoomState {
  roomId: string;
  connections: {
    [connectionId: number]: { userId: string; nonce: string; roomId: string };
  };
}

@WebSocketGateway({
  path: '/v7',
  cors: {
    origin: '*',
  },
})
export class RoomsGateway implements OnGatewayConnection {
  @WebSocketServer() server: Server;

  private roomStates: Map<string, RoomState> = new Map();
  private redis: Redis;
  private pubRedis: Redis;

  constructor(private jwtService: JwtService) {
    this.redis = new Redis('redis://localhost:6379');
    this.pubRedis = new Redis('redis://localhost:6379');
  }

  async afterInit() {
    console.log('Rooms Gateway Initialized with Redis');

    // Subscribe to Redis pub/sub channels for cluster-wide communication
    this.redis.subscribe('rooms_channel', (err) => {
      if (err) {
        console.error('Failed to subscribe: ', err);
      }
    });

    this.redis.on('message', (channel, message) => {
      if (channel === 'rooms_channel') {
        const parsedMessage = JSON.parse(message);
        this.handleBroadcastedMessage(parsedMessage);
      }
    });
  }

  async handleConnection(client: WebSocket, req: any) {
    const parsedUrl = url.parse(req.url, true);

    const roomId = parsedUrl.query['roomId'] as string;
    const token = parsedUrl.query['tok'] as string;
    const jwt = await this.jwtService.decode(token);
    const userId = jwt.uid;

    console.log(`user connected to room: ${roomId}`, userId);

    if (userId && roomId) {
      // Add ping/pong support to keep the connection alive
      client.on('ping', () => {
        client.pong();
      });
      await this.handleJoinRoom(client, { roomId, userId });
    } else {
      client.close();
    }
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    client: WebSocket,
    payload: { roomId: string; userId: string },
  ) {
    const { roomId, userId } = payload;
    let roomState = this.roomStates.get(roomId);

    if (!roomState) {
      roomState = { roomId, connections: {} };
      this.roomStates.set(roomId, roomState);
    }

    // Increment connection ID using Redis to ensure consistency across instances
    const connectionId = await this.pubRedis.incr(
      `room:${roomId}:connectionId`,
    );
    const nonce = uuidv4();
    roomState.connections[connectionId] = { userId, nonce, roomId };

    // Store client connection information in Redis for future communication
    await this.pubRedis.hset(
      `room:${roomId}:connections`,
      connectionId.toString(),
      JSON.stringify({ userId, nonce, roomId }),
    );

    // Attach connectionId to client for future reference
    (client as any).connectionId = connectionId;

    // Send initial ROOM_STATE to the user using RoomsService
    const users = await Promise.all(
      Object.keys(roomState.connections).map(async (connId) => {
        const connection = roomState.connections[parseInt(connId)];
        const roomId = connection.roomId;
        const scopes = await this.getUserScopes(roomId, connection.userId);
        return {
          connectionId: parseInt(connId),
          userId: connection.userId,
          scopes,
        };
      }),
    );

    const roomStateResponse = {
      type: ServerMsgCode.ROOM_STATE, // 使用 ServerMsgCode 枚举
      actor: connectionId,
      nonce: nonce,
      scopes: await this.getUserScopes(roomId, userId),
      users: users.reduce(
        (acc, user) => {
          acc[user.connectionId] = {
            id: user.userId,
            scopes: user.scopes,
          };
          return acc;
        },
        {} as { [key: number]: { id: string; scopes: string[] } },
      ),
    };
    client.send(JSON.stringify(roomStateResponse));

    // Notify other users in the room about the new user joined
    this.broadcastToRoom(
      roomId,
      {
        type: ServerMsgCode.USER_JOINED, // 使用 ServerMsgCode 枚举
        actor: connectionId,
        userId,
      },
      connectionId,
    );
  }

  @SubscribeMessage('leaveRoom')
  async handleLeaveRoom(
    client: WebSocket,
    payload: { roomId: string; connectionId: number },
  ) {
    const { roomId, connectionId } = payload;
    const roomState = this.roomStates.get(roomId);

    if (roomState && roomState.connections[connectionId]) {
      delete roomState.connections[connectionId];
      await this.pubRedis.hdel(
        `room:${roomId}:connections`,
        connectionId.toString(),
      );
      // Notify other users in the room about the user left
      this.broadcastToRoom(roomId, {
        type: ServerMsgCode.USER_LEFT, // 使用 ServerMsgCode 枚举
        actor: connectionId,
      });
    }
  }

  @SubscribeMessage('updatePresence')
  async handleUpdatePresence(
    client: WebSocket,
    payload: { roomId: string; connectionId: number; data: any },
  ) {
    const { roomId, connectionId, data } = payload;
    this.broadcastToRoom(roomId, {
      type: ServerMsgCode.UPDATE_PRESENCE, // 使用 ServerMsgCode 枚举
      actor: connectionId,
      data,
    });
  }

  public broadcastToRoom(
    roomId: string,
    message: any,
    excludeConnectionId?: number,
  ) {
    // Publish the message to Redis so that other instances can receive it
    this.pubRedis.publish('rooms_channel', JSON.stringify({ roomId, message }));

    // Send message to connected clients in the current instance
    const roomState = this.roomStates.get(roomId);
    if (roomState) {
      Object.keys(roomState.connections).forEach((connectionId) => {
        if (
          excludeConnectionId &&
          parseInt(connectionId) === excludeConnectionId
        ) {
          return;
        }
        for (const client of this.server.clients) {
          if (
            (client as any).connectionId === parseInt(connectionId) &&
            client.readyState === WebSocket.OPEN
          ) {
            client.send(JSON.stringify(message));
          }
        }
      });
    }
  }

  private handleBroadcastedMessage(parsedMessage: {
    roomId: string;
    message: any;
  }) {
    const { roomId, message } = parsedMessage;
    const roomState = this.roomStates.get(roomId);

    if (roomState) {
      Object.keys(roomState.connections).forEach((connectionId) => {
        Array.from(this.server.clients).forEach((client: any) => {
          if (
            client.connectionId === parseInt(connectionId) &&
            client.readyState === WebSocket.OPEN
          ) {
            client.send(JSON.stringify(message));
          }
        });
      });
    }
  }

  async getUserScopes(roomId: string, userId: string) {
    return ['room:write', 'comments:write'];
  }
}
