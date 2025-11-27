import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { validationSchema } from './config/config.validation';
import { DBConfig } from './common/types/db-config.types';
import configList from './config';
import { ResponseInterceptor } from './common/interceptors/response.interceptors';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { CatchExceptionFilter } from './common/filters/exception.filter';
import { AuthModule } from './auth/auth.module';
import { PostController } from './post/post.controller';
import { PostService } from './post/post.service';
import { PostModule } from './post/post.module';

@Module({
  imports: [
    UserModule,
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema,
      load: configList,
      cache: true,
    }),
    TypeOrmModule.forRootAsync({
      name: 'postgresConnection',
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const dbConfig = config.getOrThrow<DBConfig>('database');
        return dbConfig;
      },
    }),
    AuthModule,
    PostModule,
  ],
  controllers: [AppController, PostController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: CatchExceptionFilter,
    },
    PostService,
  ],
})
export class AppModule {}
