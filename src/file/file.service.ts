import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
  StreamableFile,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { basename, extname, join } from 'path';
import { mkdir, writeFile } from 'fs/promises';
import { createReadStream, existsSync } from 'fs';

@Injectable()
export class FileService {
  async uploadFile(file: any, folder: string) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    try {
      // Generate unique filename
      const fileExtension = file.originalname.split('.').pop();
      const fileName = `${randomUUID()}.${fileExtension}`;

      // Create directory path
      const baseDir = process.env.UPLOAD_DIR || '/';

      const uploadDir = join(baseDir, folder);

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

  

  async downloadFile(folder: string, filename: string) {
    const allowedFolders = ['images', 'documents', 'avatars'];
    if (!allowedFolders.includes(folder)) {
      throw new BadRequestException(`Invalid folder: ${folder}`);
    }

    const safeFilename = basename(filename);
    const filePath = join(process.cwd(), 'uploads', folder, safeFilename);

    this.fileExists(filePath);

    const extension = extname(filename);
    const contentType = this.getContentType(extension);
    const file = createReadStream(filePath);

    return new StreamableFile(file, {
      type: contentType,
      disposition: `inline; filename="${safeFilename}"`,
    });
  }




  private getContentType(extension: string): string {
    const contentTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml',
      '.bmp': 'image/bmp',
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx':
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.xls': 'application/vnd.ms-excel',
      '.xlsx':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.txt': 'text/plain',
      '.json': 'application/json',
      '.xml': 'application/xml',
      '.zip': 'application/zip',
      '.mp4': 'video/mp4',
      '.mp3': 'audio/mpeg',
    };
    return contentTypes[extension.toLowerCase()] || 'application/octet-stream';
  }

  fileExists(filePath: string) {
    if (!existsSync(filePath)) {
      throw new NotFoundException(`File  not found`);
    }
    return filePath;
  }
}
