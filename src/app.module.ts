import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientsModule } from './patients/patients.module';
import { UserModule } from './user/user.module';
import { PatientEntity } from './patients/entities/patient.entity';
import { UserEntity } from './user/entities/user.entity';
import { DoctorModule } from './doctor/doctor.module';
import { DoctorSpecialtyModule } from './doctor-specialty/doctor-specialty.module';
import { SpecialtyEntity } from './doctor-specialty/entities/doctor-specialty.entity';
import { DoctorEntity } from './doctor/entities/doctor.entity';
import { AvailableTimeModule } from './available_time/available_time.module';
import { TimeAvailability } from './available_time/entities/available_time.entity';
import { AppointmentModule } from './appointment/appointment.module';
import { AppointmentEntity } from './appointment/entities/appointment.entity';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { CacheInterceptor, CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import { join } from 'path';
import { FileModule } from './file/file.module';

@Module({
  imports: [
    FileModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // Configure Cache Module with Redis
    CacheModule.register({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        store: await redisStore({
          socket: {
            host: configService.get('REDIS_HOST', 'localhost'),
            port: configService.get('REDIS_PORT', 6379),
          },
          ttl: configService.get('REDIS_TTL', 60) * 1000,
          database: configService.get('REDIS_DB', 0),
        }),
      }),
    }),
    AuthModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: parseInt((configService.get('DB_PORT') as string) || '5432'),
        username: configService.get('DB_USERNAME') as string,
        password: configService.get('DB_PASSWORD') as string,
        entities: [
          UserEntity,
          PatientEntity,
          SpecialtyEntity,
          DoctorEntity,
          TimeAvailability,
          AppointmentEntity,
        ],
        database: configService.get('DB') as string,
        synchronize: configService.get('NODE_ENV') !== 'production',
        logger: 'advanced-console',
        logging: configService.get('NODE_ENV') !== 'production',
        retryDelay: 1000,
        retryAttempts: 3,
        autoLoadEntities: true,
      }),
    }),
    PatientsModule,
    UserModule,
    DoctorModule,
    DoctorSpecialtyModule,
    AvailableTimeModule,
    AppointmentModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },
  ],
})
export class AppModule {}
