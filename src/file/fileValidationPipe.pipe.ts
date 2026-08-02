import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';

export interface FileValidationOptions {
  maxSizeInMB?: number;
  allowedMimeTypes?: string[];
}

@Injectable()
export class FileSizeValidationPipe implements PipeTransform {
  private readonly maxSizeInMB: number;
  private readonly allowedMimeTypes: string[];

  constructor(options: FileValidationOptions = {}) {
    this.maxSizeInMB = options.maxSizeInMB || 2; // Default 2MB
    this.allowedMimeTypes = options.allowedMimeTypes || [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
    ];
  }

  transform(value: any, metadata: ArgumentMetadata) {

    if (!value) {
      throw new BadRequestException('No file uploaded');
    }

    // Check if file exists
    if (!value.size) {
      throw new BadRequestException('File has no size');
    }

    // Check file size
    const maxSizeInBytes = this.maxSizeInMB * 1024 * 1024;
    if (value.size > maxSizeInBytes) {
      throw new BadRequestException(
        `File size too large. Maximum allowed size is ${this.maxSizeInMB}MB, but got ${(value.size / (1024 * 1024)).toFixed(2)}MB`
      );
    }

    // Check file type (optional)
    if (this.allowedMimeTypes.length > 0 && value.mimetype) {
      if (!this.allowedMimeTypes.includes(value.mimetype)) {
        throw new BadRequestException(
          `File type ${value.mimeType} not allowed. Allowed types: ${this.allowedMimeTypes.join(', ')}`
        );
      }
    }

    // Log file info
    console.log('✅ File validated:', {
      name: value.originalname,
      size: `${(value.size / 1024).toFixed(2)} KB`,
      type: value.mimetype,
    });

    return value;
  }
}