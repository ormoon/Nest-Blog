/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsLowercase,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  MinLength,
} from 'class-validator';
import { trimString } from '../../common/utils/format.util';
import { UserRole } from '../user.entity';

export class UserDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @Transform(({ value }) => trimString(value))
  firstName: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @Transform(({ value }) => trimString(value))
  lastName: string;

  @IsNotEmpty()
  @IsEmail()
  @IsLowercase()
  @IsString()
  @Transform(({ value }) => trimString(value))
  email: string;

  @IsNotEmpty()
  @IsString()
  @Length(5, 8)
  @Transform(({ value }) => trimString(value))
  password: string;

  @IsOptional()
  @IsEnum(UserRole)
  role: UserRole;

  @IsOptional()
  @IsBoolean()
  isActive = false;
}
