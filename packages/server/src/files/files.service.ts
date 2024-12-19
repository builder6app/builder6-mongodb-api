import { Injectable, Logger } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import * as fs from 'fs-extra';
import { v4 as uuid } from 'uuid';
import * as path from 'path';
import { MongodbService } from '@builder6/core';
import stream from 'stream';
import * as mime from 'mime-types';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class FilesService {
  private s3: AWS.S3;
  public cfsStore: string;
  public storageDir: string;
  public s3Bucket: string;
  public rootUrl: string;
  private readonly logger = new Logger(FilesService.name);

  constructor(
    private configService: ConfigService,
    private mongodbService: MongodbService,
  ) {
    this.rootUrl = configService.get('root.url');
    this.storageDir = configService.get('storage.dir') || './steedos-storage';
    // 初始化 S3 客户端
    this.cfsStore = configService.get('cfs.store') || 'local';
    if (this.cfsStore === 'S3') {
      this.s3 = new AWS.S3({
        endpoint: configService.get('cfs.aws.s3.endpoint'),
        accessKeyId: configService.get('cfs.aws.s3.access.key.id'),
        secretAccessKey: configService.get('cfs.aws.s3.secret.access.key'),
        region: configService.get('cfs.aws.s3.region'),
        signatureVersion: 'v4',
      });
      this.s3Bucket = configService.get('cfs.aws.s3.bucket');
    }
  }

  getCollectionFolderName(collectionName): string {
    // 兼容 meteor
    // 如果 collectionName 为 cfs.files.filerecord，则直接返回 files
    let collectionFolderName = collectionName;
    const collectionNameParts = collectionName.split('.');
    if (
      collectionNameParts.length === 3 &&
      collectionNameParts[0] === 'cfs' &&
      collectionNameParts[2] === 'filerecord'
    ) {
      collectionFolderName = collectionNameParts[1];
    }
    return collectionFolderName;
  }

  async uploadFile(
    collectionName: string = 'cfs.files.filerecord',
    file: {
      buffer: Buffer;
      originalname: string;
      size: number;
      mimetype?: string;
    },
    metadata: {
      _id?: string;
      userId?: string;
      spaceId?: string;
      objectName?: string;
      recordId?: string;
      parentId?: string;
    },
  ): Promise<object> {
    const {
      _id = uuid(),
      objectName,
      userId,
      spaceId,
      recordId,
      parentId,
    } = metadata;

    const mimeType =
      file.mimetype ||
      mime.lookup(file.originalname) ||
      'application/octet-stream';
    let relativeKey: string;

    const md5 = crypto.createHash('md5').update(file.buffer).digest('hex');

    // 获取当前时间并生成路径
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0'); // 补全两位月份
    const uniqueFileName = `${_id}-${file.originalname}`;
    const collectionFolderName = this.getCollectionFolderName(collectionName);

    if (this.cfsStore === 'local') {
      // 构造文件存储路径，例如：objectName/2024/12/uniqueFileName
      const fileDir = path.join(
        this.storageDir,
        'files',
        collectionFolderName,
        objectName || 'default',
        year.toString(),
        month,
      );
      relativeKey = path.join(
        objectName || 'default',
        year.toString(),
        month,
        uniqueFileName,
      );
      const filePath = path.join(fileDir, uniqueFileName);

      try {
        // 确保存储目录存在
        await fs.ensureDir(fileDir);
        // 将文件写入本地存储目录
        await fs.writeFile(filePath, file.buffer);
        this.logger.log(`文件上传成功: ${filePath}`);
      } catch (err) {
        throw new Error(`文件保存到本地失败: ${err.message}`);
      }
    } else if (this.cfsStore === 'S3') {
      // 如果存储配置为 S3
      const collectionFolderName = this.getCollectionFolderName(collectionName);

      // 构造 S3 中的文件路径，例如：objectName/2024/12/uniqueFileName
      relativeKey = `${collectionFolderName}/${objectName || 'default'}/${year}/${month}/${uniqueFileName}`;
      const params = {
        Bucket: this.s3Bucket,
        Key: relativeKey,
        Body: file.buffer,
        ContentType: mimeType,
      };

      try {
        const data = await this.s3.upload(params).promise();
        this.logger.log(`文件上传S3成功: ${relativeKey}`);
      } catch (err) {
        throw new Error(`文件上传失败: ${err.message}`);
      }
    } else {
      throw new Error('未知的文件存储类型');
    }

    const savedRecord = await this.mongodbService.insertOne(collectionName, {
      _id,
      original: {
        type: mimeType,
        size: file.size,
        name: file.originalname,
        md5,
      },
      metadata: {
        owner: userId,
        space: spaceId,
        record_id: recordId,
        object_name: objectName,
        parent: parentId,
      },
      copies: {
        files: {
          name: file.originalname,
          type: mimeType,
          size: file.size,
          key: relativeKey,
          updatedAt: new Date(),
          createdAt: new Date(),
        },
      },
    });

    // 返回文件 ID 和相对路径
    return savedRecord;
  }

  async getFile(collectionName: string, fileId: string): Promise<any> {
    const fileRecord = await this.mongodbService.findOne(collectionName, {
      _id: fileId,
    });

    return fileRecord;
  }

  async getPreSignedUrl(
    collectionName: string,
    fileId: string,
  ): Promise<string | null> {
    // 查询文件记录，获取相关信息
    const fileRecord = await this.mongodbService.findOne(collectionName, {
      _id: fileId,
    });

    if (!fileRecord) {
      throw new Error('未找到指定的文件记录');
    }

    if (this.cfsStore === 'S3') {
      const key = fileRecord.copies.files.key;

      const params = {
        Bucket: this.s3Bucket,
        Key: key,
        Expires: 60 * 5, // 5分钟有效期
      };

      try {
        // S3 存储：生成 signed URL
        return this.s3.getSignedUrl('getObject', params);
      } catch (err) {
        throw new Error(`生成 S3 签名 URL 失败: ${err.message}`);
      }
    } else if (this.cfsStore === 'local') {
      return (
        this.rootUrl +
        '/api/v6/files/' +
        collectionName +
        '/' +
        fileId +
        '/' +
        fileRecord.original.name
      );
    }

    return null;
  }

  async downloadFileStream(
    collectionName: string,
    fileId: string,
  ): Promise<stream.Readable> {
    // 查询文件记录，获取相关信息
    const fileRecord = await this.mongodbService.findOne(collectionName, {
      _id: fileId,
    });

    if (!fileRecord) {
      throw new Error('未找到指定的文件记录');
    }

    if (this.cfsStore === 'local') {
      try {
        // 构造文件存储路径，例如：objectName/2024/12/uniqueFileName
        const key = fileRecord.copies.files.key;
        const collectionFolderName =
          this.getCollectionFolderName(collectionName);
        const fileUrl = path.join(
          this.storageDir,
          'files',
          collectionFolderName,
          key,
        );
        // 检测文件是否存在，否则返回空
        if (!(await fs.pathExists(fileUrl))) {
          throw new Error('文件不存在');
        }
        // 本地存储：从文件系统中创建可读流
        return fs.createReadStream(fileUrl);
      } catch (err) {
        throw new Error(`文件下载失败: ${err.message}`);
      }
    } else if (this.cfsStore === 'S3') {
      const key = fileRecord.copies.files.key;

      const params = {
        Bucket: this.s3Bucket,
        Key: key,
        Expires: 60 * 60, // 60分钟有效期
      };

      try {
        // S3 存储：从 S3 创建可读流
        const s3Object = this.s3.getObject(params);
        return s3Object.createReadStream();
      } catch (err) {
        throw new Error(`文件下载失败: ${err.message}`);
      }
    } else {
      throw new Error('未知的文件存储类型');
    }
  }
}
