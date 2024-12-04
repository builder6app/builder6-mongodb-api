import { MongodbService } from '@/mongodb/mongodb.service';
import { Injectable } from '@nestjs/common';

export interface CreateThreadParams {
  id?: string;
  comment?: CreateCommentParams;
  metadata?: object;
  resolved: boolean;
  roomId?: string;
  userId?: string;
}

export interface CreateCommentParams {
  id?: string;
  attachmentIds: string[];
  body: object;
  roomId?: string;
  threadId?: string;
  userId?: string;
}

export interface Attachment {
  id: string;
  mimeType: string;
  name: string;
  size: number;
  type: string;
}

@Injectable()
export class RoomsService {
  constructor(private mongodbService: MongodbService) {}

  async getAttachmentById(attachmentId: string): Promise<Attachment> {
    // 模拟从数据库获取附件
    // 实际实现中应替换为数据库查询

    const attachment = await this.mongodbService.findOne(
      'cfs.files.filerecord',
      {
        _id: attachmentId,
      },
    );
    return {
      id: attachmentId,
      mimeType: attachment.original.type,
      name: attachment.original.name,
      size: attachment.original.size,
      type: 'attachment',
    };
  }

  async getUsers(userIds: string | string[]) {
    if (typeof userIds === 'string') {
      userIds = [userIds];
    }
    const users = [];

    for (const userId of userIds) {
      const user = await this.mongodbService.findOne('users', {
        _id: userId,
      });
      users.push({
        name: user ? user.name : 'Unknown',
        // avatar: "https://liveblocks.io/avatars/avatar-4.png"
      });
    }

    return users;
  }

  async getThreads(roomId: string) {
    const threads = await this.mongodbService.find('b6_threads', {
      roomId: roomId,
    });

    for (const thread of threads) {
      const comments = await this.getComments(roomId, thread.id);
      thread.comments = comments;
    }
    return threads;
  }

  async getComments(roomId: string, threadId: string) {
    const comments = await this.mongodbService.find('b6_comments', {
      roomId: roomId,
      threadId: threadId,
    });

    for (const comment of comments) {
      comment.attachments = [];
      for (const attachmentId of comment.attachmentIds) {
        const attachment = await this.getAttachmentById(attachmentId);
        comment.attachments.push(attachment);
      }
    }
    return comments;
  }

  async createThread({
    id,
    comment,
    metadata,
    resolved = false,
    roomId,
    userId,
  }: CreateThreadParams) {
    const newThread = {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      _id: id,
      id,
      resolved,
      metadata,
      type: 'thread',
      roomId,
      userId,
    };

    const result = await this.mongodbService.insertOne('b6_threads', newThread);

    const newComment = await this.createComment({
      id: comment.id,
      attachmentIds: comment.attachmentIds,
      body: comment.body,
      roomId,
      threadId: id,
      userId,
    });
    result.comments = [newComment];

    return result;
  }

  async updateThread(
    threadId,
    { metadata, resolved = false, userId }: CreateThreadParams,
  ) {
    const newThread = {
      updatedAt: new Date().toISOString(),
      resolved,
      metadata,
      userId,
    };

    const result = await this.mongodbService.findOneAndUpdate(
      'b6_threads',
      threadId,
      newThread,
    );

    return result;
  }

  async createComment({
    id,
    attachmentIds,
    body,
    roomId,
    threadId,
    userId,
  }: CreateCommentParams) {
    const newComment = {
      createdAt: new Date().toISOString(),
      _id: id,
      id,
      reactions: [],
      roomId,
      threadId,
      userId,
      type: 'comment',
      attachmentIds,
      body,
    };

    const result = await this.mongodbService.insertOne(
      'b6_comments',
      newComment,
    );
    result.attachments = [];

    for (const attachmentId of attachmentIds) {
      const attachment = await this.getAttachmentById(attachmentId);
      result.attachments.push(attachment);
    }

    delete result['_id'];
    delete result['attachmentIds'];
    return result;
  }

  async updateComment(
    commentId,
    { attachmentIds, body, userId }: CreateCommentParams,
  ) {
    const newComment = {
      updatedAt: new Date().toISOString(),
      type: 'comment',
      attachmentIds,
      body,
      userId,
    };

    const result = await this.mongodbService.findOneAndUpdate(
      'b6_comments',
      commentId,
      newComment,
    );
    result.attachments = [];

    for (const attachmentId of attachmentIds) {
      const attachment = await this.getAttachmentById(attachmentId);
      result.attachments.push(attachment);
    }

    delete result['_id'];
    delete result['attachmentIds'];
    return result;
  }

  async deleteComment(commentId) {
    // TODO: 应该先删除附件。

    const result = await this.mongodbService.deleteOne(
      'b6_comments',
      commentId,
    );

    return result;
  }
}
