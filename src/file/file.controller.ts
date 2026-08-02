import {
  BadRequestException,
  Controller,
  Get,
  Header,
  NotFoundException,
  Param,
  Post,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileService } from './file.service';
import { FileSizeValidationPipe } from './fileValidationPipe.pipe';
import { createReadStream, createWriteStream, existsSync } from 'fs';
import { basename, extname, join } from 'path';

@Controller('file')
export class FileController {
  constructor(private readonly uploaderService: FileService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile(
      new FileSizeValidationPipe({
        maxSizeInMB: 15,
        allowedMimeTypes: ['audio/mpeg'],
      }),
    )
    file: any,
  ) {
    console.log(file);
    return this.uploaderService.uploadFile(file, 'songs');
  }

  // Method 2: Using StreamableFile (NestJS 9+)
  @Get('streamable/:folder/:filename')
  @Header('Cache-Control', 'public, max-age=86400')
 async streamFileStreamable(
    @Param('folder') folder: string,
    @Param('filename') filename: string,
  ): Promise <StreamableFile> {
  const res=await this.uploaderService.downloadFile(folder,filename)
  return res
  
  }}
