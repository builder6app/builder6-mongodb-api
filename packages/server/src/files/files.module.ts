import { Module } from '@nestjs/common';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { AuthModule, MongodbModule } from '@builder6/core';
import { FilesMoleculer } from './files.moleculer';

@Module({
  imports: [AuthModule, MongodbModule],
  controllers: [FilesController],
  providers: [FilesService, FilesMoleculer],
  exports: [FilesService],
})
export class FilesModule {}
