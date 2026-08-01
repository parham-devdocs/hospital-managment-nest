import { Injectable, ExecutionContext } from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';

@Injectable()
export class IdCacheInterceptor extends CacheInterceptor {
  trackBy(context: ExecutionContext): string | undefined {
    const request = context.switchToHttp().getRequest();
    const { specialtyId } = request.params;
    
    // Dynamic cache key based on doctorId
    return `specialty-id:${specialtyId}`;
  }
}