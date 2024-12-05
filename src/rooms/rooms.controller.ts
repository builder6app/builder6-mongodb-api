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
  Put,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RoomsGuard } from './rooms.guard';
import * as rawBody from 'raw-body';
import { Request } from 'express';
import { FilesService } from '@/files/files.service';

@Controller('v2/c/')
export class RoomsController {
  constructor(
    private roomsService: RoomsService,
    private filesService: FilesService,
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
  @Post('rooms/:roomId/threads/:threadId/mark-as-resolved')
  async threadMarkasResolved(
    @Req() req: Request,
    @Param('roomId') roomId: string,
    @Param('threadId') threadId: string,
  ) {
    const newThread = this.roomsService.updateThread(threadId, {
      resolved: true,
    });
    return newThread;
  }

  @UseGuards(RoomsGuard)
  @Post('rooms/:roomId/threads/:threadId/mark-as-unresolved')
  async threadMarkasUnResolved(
    @Req() req: Request,
    @Param('roomId') roomId: string,
    @Param('threadId') threadId: string,
  ) {
    const newThread = this.roomsService.updateThread(threadId, {
      resolved: false,
    });
    return newThread;
  }

  // 创建回复
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

  // 获取下载Url
  @Post('rooms/:roomId/attachments/presigned-urls')
  async presignedUrls(@Body('attachmentIds') attachmentIds: string[]) {
    const urls = await Promise.all(
      attachmentIds.map(async (attachmentId) => {
        return this.filesService.getPreSignedUrl(
          'cfs.files.filerecord',
          attachmentId,
        );
      }),
    );
    return { urls };
  }

  // 上传文件
  @Put('rooms/:roomId/attachments/:attachmentId/upload/:fileName')
  async uploadFile(
    @Param('roomId') roomId: string,
    @Param('attachmentId') attachmentId: string,
    @Param('fileName') fileName: string,
    @Query('fileSize') fileSize: number,
    @Req() req: Request,
  ) {
    // 检查 content-type 是否为 application/octet-stream
    if (req.headers['content-type'] !== 'application/octet-stream') {
      throw new HttpException('Invalid content type', HttpStatus.BAD_REQUEST);
    }

    const fileBuffer = await rawBody(req);

    // 构造类似 Express.Multer.File 的对象
    const file = {
      buffer: fileBuffer,
      originalname: fileName,
      size: fileSize,
    };

    const metadata = {
      _id: attachmentId,
      objectName: 'b6_rooms',
      recordId: roomId,
    };

    if (!file) {
      throw new Error('未找到上传的文件');
    }
    const fileRecord = await this.filesService.uploadFile(
      'cfs.files.filerecord',
      file,
      metadata,
    );
    return fileRecord;
  }

  // 创建Reaction
  @UseGuards(RoomsGuard)
  @Post('rooms/:roomId/threads/:threadId/comments/:commentId/reactions')
  async createReaction(
    @Req() req: Request,
    @Param('roomId') roomId: string,
    @Param('threadId') threadId: string,
    @Param('commentId') commentId: string,
    @Body('emoji') emoji: string,
  ) {
    const userId = req['jwt'].uid;
    const newComment = this.roomsService.createReaction(commentId, {
      userId: userId,
      emoji: emoji,
    });
    return newComment;
  }

  //删除Reaction
  @UseGuards(RoomsGuard)
  @Delete(
    'rooms/:roomId/threads/:threadId/comments/:commentId/reactions/:emoji',
  )
  async deleteReaction(
    @Req() req: Request,
    @Param('roomId') roomId: string,
    @Param('threadId') threadId: string,
    @Param('commentId') commentId: string,
    @Param('emoji') emoji: string,
  ) {
    const userId = req['jwt'].uid;
    this.roomsService.deleteReaction(commentId, { emoji, userId });
    return {};
  }
}
