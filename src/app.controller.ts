import { Controller, Get, Inject } from '@nestjs/common';
import { AppService } from './app.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {type Cache } from 'cache-manager';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache

  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
 // Debug endpoint to check cache
 @Get('cache-check')
 async checkCache() {
   // Try to get the cached data
   const cached = await this.cacheManager.get('all-appointments');
   
   // Get all cache keys (in-memory store doesn't support keys() directly)
   let allKeys = [];
   try {
     // This works for in-memory cache
     const store = this.cacheManager.stores as any;
     if (store.keys) {
       allKeys = await store.keys();
     }
   } catch (e) {
   }
   
   return {
     hasCachedData: !!cached,
     cachedDataLength: cached ? JSON.stringify(cached).length : 0,
     cachedDataPreview: cached ? JSON.stringify(cached).substring(0, 200) : null,
     allKeys: allKeys,
     timestamp: new Date().toISOString(),
   };
  }}