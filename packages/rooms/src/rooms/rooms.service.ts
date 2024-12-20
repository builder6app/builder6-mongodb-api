import { MongodbService } from '@builder6/core';
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

  // 按照 email, name, username 搜索用户, 返回 userId 数组
  async searchUsers(
    spaceId: string,
    keyword: string,
    roomId: string,
  ): Promise<string[]> {
    const spaceUsers = await this.mongodbService.find('space_users', {
      space: spaceId,
      $or: [
        { username: { $regex: keyword, $options: 'i' } },
        { email: { $regex: keyword, $options: 'i' } },
        { name: { $regex: keyword, $options: 'i' } },
      ],
    });

    return spaceUsers.map((spaceUser) => spaceUser.user as string);
  }

  async getThread(roomId: string, threadId: string) {
    const thread = await this.mongodbService.findOne('b6_threads', {
      roomId: roomId,
      _id: threadId,
    });

    if (!thread) {
      return null;
    }

    const comments = await this.getComments(roomId, threadId);
    thread.comments = comments;
    return thread;
  }

  async getThreads(roomId: string, since?: Date) {
    const queryOptions = { roomId: roomId } as any;
    if (since) {
      queryOptions.updatedAt = { $gt: since };
    }
    const threads = await this.mongodbService.find('b6_threads', queryOptions);

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

  async updateThread(threadId, thread?: CreateThreadParams) {
    const newThread = {
      updatedAt: new Date().toISOString(),
      ...thread,
    };

    const result = await this.mongodbService.findOneAndUpdate(
      'b6_threads',
      { _id: threadId },
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

    const result = (await this.mongodbService.findOneAndUpdate(
      'b6_comments',
      { _id: commentId },
      newComment,
    )) as any;
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

    const result = await this.mongodbService.deleteOne('b6_comments', {
      _id: commentId,
    });

    return result;
  }

  /* 评论点赞 
  保存在 comments 中，格式如下： 
  comment: {
    _id,
    reactions: [
      {
          "emoji": "🥵",
          "createdAt": "2024-12-05T01:49:22.395Z",
          "users": [
              {
                  "id": "user-5"
              }
              {
                  "id": "user-6"
              }
          ]
      },
    ]
    reactions 数组中的每个元素表示一个用户的点赞，其中 emoji 为表情，createdAt 为点赞时间，users 为点赞用户列表。
    创建时，如果 reactions 中已经有相同 emoji 的点赞，则直接添加到 users 中，否则创建一个新的点赞。
  }
  */ async createReaction(
    commentId: string,
    { userId, emoji }: { userId: string; emoji: string },
  ) {
    const comment = await this.mongodbService.findOne('b6_comments', {
      _id: commentId,
    });
    if (!comment) {
      throw new Error('Comment not found');
    }

    // 查找是否已经存在相同 emoji 的 reaction
    let reaction = comment.reactions.find(
      (reaction) => reaction.emoji === emoji,
    );
    if (reaction) {
      // 如果存在，检查用户是否已经点赞，避免重复添加
      const userExists = reaction.users.some((user) => user.id === userId);
      if (!userExists) {
        reaction.users.push({ id: userId });
      }
    } else {
      // 如果不存在，创建新的 reaction 并推入 reactions 数组
      reaction = {
        emoji,
        createdAt: new Date().toISOString(),
        users: [{ id: userId }],
      };
      comment.reactions.push(reaction);
    }

    // 更新数据库
    await this.mongodbService.findOneAndUpdate(
      'b6_comments',
      { _id: commentId },
      comment,
    );

    return {
      emoji,
      createdAt: reaction.createdAt,
      userId,
    };
  }

  async deleteReaction(
    commentId: string,
    { userId, emoji }: { userId: string; emoji: string },
  ) {
    const comment = await this.mongodbService.findOne('b6_comments', {
      _id: commentId,
    });
    if (!comment) {
      throw new Error('Comment not found');
    }

    const reaction = comment.reactions.find(
      (reaction) => reaction.emoji === emoji,
    );
    if (!reaction) {
      throw new Error('Reaction not found');
    }

    reaction.users = reaction.users.filter((user) => user.id !== userId);

    comment.reactions = comment.reactions.filter(
      (reaction) => reaction.users.length > 0,
    );

    await this.mongodbService.findOneAndUpdate(
      'b6_comments',
      { _id: commentId },
      comment,
    );

    return null;
  }
}
