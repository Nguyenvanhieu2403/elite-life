import { Module } from '@nestjs/common';
import { UploadFilesService } from './upload-files.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UploadFiles } from 'src/database/entities/uploadFiles.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UploadFiles])
  ],
  controllers: [],
  providers: [UploadFilesService],
})
export class UploadFilesModule { }
