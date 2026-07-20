import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthEntity } from './auth/entities/auth.entity';

import { PatientsModule } from './patients/patients.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule.forRoot({ envFilePath: '.env', isGlobal: true })],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: 'localhost',
        port: parseInt(configService.get('DB_PORT') as string),
        username: configService.get('DB_USERNAME') as string,
        password: configService.get('DB_PASSWORD') as string,
        entities: [AuthEntity],
        database: configService.get('DB') as string,
        synchronize: true,
        logger: 'advanced-console',
        logging: configService.get('NODE_ENV') !== 'production',
        retryDelay: 1000,
        retryAttempts: 3,
        autoLoadEntities: true,
      })}),
    PatientsModule
  ], 
   controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
