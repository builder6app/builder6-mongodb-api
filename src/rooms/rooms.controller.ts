import { RoomsService } from './rooms.service';
import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';

@Controller('v2/c/')
export class RoomsController {
  constructor(private roomsService: RoomsService) {}

  @Get('users')
  async getUsers(@Query('userIds') userIds: string | string[]) {
    const users = await this.roomsService.getUsers(userIds);
    console.log('getUsers', userIds, users);
    return users;
  }

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

  @Post('rooms/:roomId/threads')
  async createThread(
    @Param('roomId') roomId: string,
    @Body() record: Record<string, any>,
  ) {
    const userId = 'test';
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

  @Post('rooms/:roomId/threads/:threadId/comments')
  async createComment(
    @Param('roomId') roomId: string,
    @Param('threadId') threadId: string,
    @Body() record: Record<string, any>,
  ) {
    const userId = 'test';
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
}
