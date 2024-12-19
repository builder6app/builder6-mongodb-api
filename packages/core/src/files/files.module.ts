import { Module } from '@nestjs/common';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { MongodbModule } from '../mongodb/mongodb.module';
import { FilesMoleculer } from './files.moleculer';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule, MongodbModule],
  controllers: [FilesController],
  providers: [FilesService, FilesMoleculer],
  exports: [FilesService],
})
export class FilesModule {}
