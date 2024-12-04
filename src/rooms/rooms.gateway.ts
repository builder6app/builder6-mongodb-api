import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { WebSocket, Server, Socket } from 'ws';
import * as url from 'url';
import { v4 as uuidv4 } from 'uuid';

@WebSocketGateway({
  path: '/v7',
  cors: {
    origin: '*',
  },
})
export class RoomsGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  // afterInit(server: Server) {
  //   console.log('WebSocket server initialized');
  // }

  handleConnection(client: WebSocket, req: any) {
    const parsedUrl = url.parse(req.url, true);

    const roomId = parsedUrl.query['roomId'];
    // const token = parsedUrl.query['tok'];

    console.log(`Client connected to room: ${roomId}`);
    // console.log(`Token: ${token}`);

    const msg = {
      type: 104,
      actor: 3904,
      nonce: uuidv4(),
      scopes: ['room:write'],
      users: {},
    };
    client.send(JSON.stringify(msg));
  }

  // handleDisconnect(client: WebSocket) {
  //   console.log('Client disconnected');
  // }

  @SubscribeMessage('message')
  handleMessage(@MessageBody() data: string, client: Socket): void {
    console.log(data);
    client.send('Hello, client!');
  }
}
