import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from './files.service';
import { Response } from 'express';

@Controller('api/v6/files/')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post(':collectionName')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @Param('collectionName') collectionName: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new Error('未找到上传的文件');
    }
    const fileUrl = await this.filesService.uploadFile(
      collectionName,
      file,
      {},
    );
    return {
      url: fileUrl,
    };
  }

  @Get(':collectionName/:fileId')
  async downloadFile(
    @Param('collectionName') collectionName: string,
    @Param('fileId') fileId: string,
    @Res() res: Response,
  ): Promise<void> {
    try {
      // 判断文件存储类型是否为 S3，如果是则生成 signed URL 并跳转
      if (this.filesService.cfsStore === 'S3') {
        const s3SignedUrl = await this.filesService.getPreSignedUrl(
          collectionName,
          fileId,
        );
        if (s3SignedUrl) {
          // 如果是 S3 存储，直接重定向到 signed URL
          return res.redirect(s3SignedUrl);
        }
      }

      const fileStream = await this.filesService.downloadFileStream(
        collectionName,
        fileId,
      );

      // 使用流的方式将下载的文件发送给客户端
      fileStream.pipe(res).on('error', () => {
        throw new HttpException(
          '文件下载失败',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      });
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
