// interceptors/custom-cache.interceptor.ts
import { CacheInterceptor } from '@nestjs/cache-manager';
import { ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class CustomCacheInterceptor extends CacheInterceptor {
  protected trackBy(context: ExecutionContext): string | undefined {
    const request = context.switchToHttp().getRequest<Request>();
    
    // Include the full URL with query parameters
    const url = request.url;
    
    // Or build a custom key with specific query params
    const { status, doctorId, from, to, page, limit } = request.query;
    const key = `appointments:${status || 'all'}:${doctorId || 'all'}:${from || 'all'}:${to || 'all'}:${page || '1'}:${limit || '10'}`;
    
    console.log('🔑 Cache key:', key);
    return key;
  }
}