import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploaderService } from './uploader.service';
import { FileSizeValidationPipe } from './fileValidationPipe.pipe';

@Controller('upload')
export class UploaderController {
  constructor(private readonly uploaderService: UploaderService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile(new FileSizeValidationPipe({ maxSizeInMB: 15,allowedMimeTypes:["audio/mpeg"] }))
    file: any
  ) {
    console.log(file)
    return this.uploaderService.uploadFile(file,'songs');
  }
}