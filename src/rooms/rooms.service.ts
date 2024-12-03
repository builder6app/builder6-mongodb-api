import { MongodbService } from '@/mongodb/mongodb.service';
import { Injectable } from '@nestjs/common';

export interface CreateThreadParams {
  id: string;
  comment: CreateCommentParams;
  metadata: object;
  resolved: boolean;
  roomId: string;
  userId: string;
}

export interface CreateCommentParams {
  id: string;
  attachmentIds: string[];
  body: object;
  roomId?: string;
  threadId?: string;
  userId?: string;
}

export interface Attachment {
  id: string;
  // 其他属性
}

@Injectable()
export class RoomsService {
  constructor(private mongodbService: MongodbService) {}

  async getAttachmentById(attachmentId: string): Promise<Attachment> {
    // 模拟从数据库获取附件
    // 实际实现中应替换为数据库查询
    return { id: attachmentId };
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
}
