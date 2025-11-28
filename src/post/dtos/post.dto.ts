import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { PostStatus } from '../post.entity';

export class PostDto {
  @IsNotEmpty()
  @IsString()
  category: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(10)
  title: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(5)
  slug: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(300)
  content: string;

  @IsOptional()
  @IsString()
  summary?: string;

  @IsNotEmpty()
  @IsNumber()
  author: number;

  @IsOptional()
  @IsEnum(PostStatus)
  status?: PostStatus;
}
