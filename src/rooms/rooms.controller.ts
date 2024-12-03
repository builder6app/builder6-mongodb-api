import { MongodbService } from '@/mongodb/mongodb.service';
import { Controller, Get, Post, Body, Param } from '@nestjs/common';

@Controller('v2')
export class RoomsController {
  constructor(private mongodbService: MongodbService) {}

  @Get('c/rooms/:roomId/threads')
  async getThreads(@Param('roomId') roomId: string) {
    return {
      data: [
        {
          type: 'thread',
          id: 'th_FV9CHRsVWAY0YgK8wJJl8',
          roomId: roomId,
          comments: [
            {
              type: 'comment',
              threadId: 'th_FV9CHRsVWAY0YgK8wJJl8',
              roomId: roomId,
              id: 'cm_t0Yjq3Oy-X4QNRliMc17-',
              userId: 'sGmLpaDV7Jh0wIPJacXeJQ1Yi_',
              createdAt: '2024-11-27T08:04:16.188Z',
              reactions: [],
              attachments: [],
              body: {
                version: 1,
                content: [
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'hello world',
                      },
                    ],
                  },
                ],
              },
            },
            {
              type: 'comment',
              threadId: 'th_FV9CHRsVWAY0YgK8wJJl8',
              roomId: roomId,
              id: 'cm_Ra8CW8BksyHMIkUOTYDbX',
              userId: 'nPWfM0CgoqD1h2Nmz6s9hkSK73',
              createdAt: '2024-12-03T02:01:41.056Z',
              reactions: [],
              attachments: [],
              body: {
                version: 1,
                content: [
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'okok',
                      },
                    ],
                  },
                ],
              },
            },
          ],
          createdAt: '2024-11-27T08:04:16.188Z',
          metadata: {},
          updatedAt: '2024-12-03T02:01:41.057Z',
          resolved: false,
        },
      ],
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

  @Post('c/rooms/:roomId/threads/:threadId/comments')
  async postComment(
    @Param('roomId') roomId: string,
    @Param('threadId') threadId: string,
    @Body() record: Record<string, any>,
  ) {
    const userId = 'test';
    const comment = {
      createdAt: new Date().toISOString(),
      _id: record.id,
      reactions: [],
      roomId,
      threadId,
      userId,
      type: 'comment',
      attachments: [],
      ...record,
    };
    const newComment = this.mongodbService.insertOne('b6_comments', comment);
    delete comment['_id'];
    return newComment;
  }
}
