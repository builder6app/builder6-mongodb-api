import { AuthGuard } from '@/auth/auth.guard';
import { RoomsService } from './rooms.service';
import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RoomsGuard } from './rooms.guard';

@Controller('v2/c/')
export class RoomsController {
  constructor(
    private roomsService: RoomsService,
    private jwtService: JwtService,
  ) {}

  @UseGuards(AuthGuard)
  @Post('auth')
  async getAuthToken(@Body() body: { room: string }, @Req() req: Request) {
    const user = req['user'];
    const { room = 'undefined' } = body;
    const payload = {
      k: 'acc',
      pid: user.space,
      uid: user.user,
      mcpr: 10,
      perms: {},
      jti: 'S4EMiESTDe6k',
    };
    payload.perms[room] = ['room:write', 'comments:write'];
    const token = await this.jwtService.signAsync(payload);
    return { token };
  }

  @UseGuards(AuthGuard)
  @Get('users')
  async getUsers(@Query('userIds') userIds: string | string[]) {
    const users = await this.roomsService.getUsers(userIds);
    return users;
  }

  @UseGuards(RoomsGuard)
  @Get('rooms/:roomId/threads')
  async getThreads(@Param('roomId') roomId: string) {
    const threads = await this.roomsService.getThreads(roomId);
    return {
      data: threads,
      inboxNotifications: [],
      meta: {
        nextCursor: null,
        requestedAt: '2024-12-03T02:06:09.152Z',
        permissionHints: {
          'react-comments-RWwFF6OZMiPopsA': ['room:write'],
        },
      },
      deletedThreads: [],
      deletedInboxNotifications: [],
    };
  }

  @UseGuards(RoomsGuard)
  @Post('rooms/:roomId/threads')
  async createThread(
    @Req() req: Request,
    @Param('roomId') roomId: string,
    @Body() record: Record<string, any>,
  ) {
    const userId = req['jwt'].uid;
    const newThread = this.roomsService.createThread({
      id: record.id,
      comment: record.comment,
      roomId,
      userId,
      metadata: {},
      resolved: false,
    });
    return newThread;
  }

  @UseGuards(RoomsGuard)
  @Post('rooms/:roomId/threads/:threadId/comments')
  async createComment(
    @Req() req: Request,
    @Param('roomId') roomId: string,
    @Param('threadId') threadId: string,
    @Body() record: Record<string, any>,
  ) {
    const userId = req['jwt'].uid;
    const newComment = this.roomsService.createComment({
      id: record.id,
      attachmentIds: record.attachmentIds,
      body: record.body,
      roomId,
      threadId: threadId,
      userId: userId,
    });
    return newComment;
  }

  @UseGuards(RoomsGuard)
  @Post('rooms/:roomId/threads/:threadId/comments/:commentId')
  async updateComment(
    @Req() req: Request,
    @Param('roomId') roomId: string,
    @Param('threadId') threadId: string,
    @Param('commentId') commentId: string,
    @Body() record: Record<string, any>,
  ) {
    const userId = req['jwt'].uid;
    const newComment = this.roomsService.updateComment(commentId, {
      attachmentIds: record.attachmentIds,
      body: record.body,
      userId,
    });
    return newComment;
  }

  @UseGuards(RoomsGuard)
  @Delete('rooms/:roomId/threads/:threadId/comments/:commentId')
  async deleteComment(
    @Req() req: Request,
    @Param('roomId') roomId: string,
    @Param('threadId') threadId: string,
    @Param('commentId') commentId: string,
  ) {
    this.roomsService.deleteComment(commentId);
    return {};
  }
}
