import { Module } from '@nestjs/common';
import { UploadFilesService } from './upload-files.service';
import { UploadFiles } from 'src/database/entities/uploadFiles.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([UploadFiles])],
  controllers: [],
  providers: [UploadFilesService],
})
export class UploadFilesModule { }
