import { Module } from '@nestjs/common';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { MongodbModule } from '@builder6/core';
import { FilesMoleculer } from './files.moleculer';

@Module({
  imports: [MongodbModule],
  controllers: [FilesController],
  providers: [FilesService, FilesMoleculer],
  exports: [FilesService],
})
export class FilesModule {}
