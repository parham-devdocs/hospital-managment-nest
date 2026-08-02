import { BadRequestException, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { join } from 'path';
import { mkdir, writeFile } from 'fs/promises';
import { existsSync } from 'fs';

@Injectable()
export class UploaderService {
  async uploadFile(file: any,folder:string) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    try {
      // Generate unique filename
      const fileExtension = file.originalname.split('.').pop();
      const fileName = `${randomUUID()}.${fileExtension}`;

      // Create directory path
      const uploadDir = join(process.cwd(), 'upload', folder);

      // Check if directory exists, create if not
      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true });
        console.log(`📁 Created directory: ${uploadDir}`);
      }

      // Full file path
      const filePath = join(uploadDir, fileName);

      // Write file
      await writeFile(filePath, file.buffer);
      console.log(`✅ File saved: ${fileName}`);

      return {
        message: 'File uploaded successfully',
        filename: fileName,
        originalName: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
        path: filePath,
      };
    } catch (error) {
      console.error('Error saving file:', error);
      throw new ServiceUnavailableException('Failed to save file');
    }
  }
}