// logger.service.ts
import { Injectable } from '@nestjs/common';
import winston from 'winston';

@Injectable()
export class LoggerService {
  private logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.File({ 
          filename: 'error.log', 
          level: 'error' 
        }),
        new winston.transports.File({ 
          filename: 'combined.log' 
        }),
      ],
      exceptionHandlers: [
        new winston.transports.File({ filename: 'exceptions.log' })
      ],
      rejectionHandlers: [
        new winston.transports.File({ filename: 'rejections.log' })
      ],
      exitOnError: false,
    });

 
  }

  info(message: string, context?: any) {
    this.logger.info(message, context);
  }

  error(message: string, trace?: string |null, context?: any) {
    this.logger.error(message, { trace, ...context });
  }

  warn(message: string, context?: any) {
    this.logger.warn(message, context);
  }

  debug(message: string, context?: any) {
    this.logger.debug(message, context);
  }

  verbose(message: string, context?: any) {
    this.logger.verbose(message, context);
  }

  getLogger(): winston.Logger {
    return this.logger;
  }
}