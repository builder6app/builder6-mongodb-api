import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { v4 as uuid } from 'uuid';

@Injectable()
export class FilesService {
  private s3: AWS.S3;

  constructor() {
    // 初始化 S3 客户端
    this.s3 = new AWS.S3({
      endpoint: process.env.STEEDOS_CFS_AWS_S3_ENDPOINT,
      accessKeyId: process.env.STEEDOS_CFS_AWS_S3_ACCESS_KEY_ID,
      secretAccessKey: process.env.STEEDOS_CFS_AWS_S3_SECRET_ACCESS_KEY,
      region: process.env.STEEDOS_CFS_AWS_S3_REGION,
    });
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    const bucketName = process.env.STEEDOS_CFS_AWS_S3_BUCKET;

    const params = {
      Bucket: bucketName,
      Key: `${uuid()}-${file.originalname}`, // 生成唯一的文件名
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    try {
      const data = await this.s3.upload(params).promise();
      return data.Location; // 返回文件的 S3 URL
    } catch (err) {
      throw new Error(`文件上传失败: ${err.message}`);
    }
  }
}
