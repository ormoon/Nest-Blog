import {
  Controller,
  Get,
  Query,
  Post,
  Body,
  Put,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UserDto } from './dtos/user.dto';
import { QueryDto } from '../common/dtos/query.dto';
import { LIMIT, PAGE } from '../config/default-value.config';
import { hashPassword } from '../common/utils/bcrypt.util';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { User, UserRole } from './user.entity';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async create(@Body() createUserDto: UserDto) {
    const { password, ...rest } = createUserDto;
    const hashPass = await hashPassword(password);
    const userPayload = { ...rest, password: hashPass };
    const user = await this.userService.create(userPayload);
    return {
      message: 'User created successfully',
      data: user,
    };
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async findAll(@Query() query: QueryDto) {
    const [users, totalData] = await this.userService.findAll(query);
    const { limit = LIMIT, page = PAGE } = query;
    const totalPages = Math.ceil(totalData / +limit);
    return {
      message: 'Users retrieved successfully',
      data: users,
      meta: {
        totalData,
        limit,
        page,
        totalPages,
        hasNext: +page < totalPages,
      },
    };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const user = await this.userService.findOneById(id);
    return {
      message: 'User retrieved successfully',
      data: user,
    };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: Partial<UserDto>,
    @CurrentUser() currentUser: User,
  ) {
    if (currentUser.id !== id && currentUser.role !== UserRole.ADMIN) {
      throw new HttpException(
        'You are not authorized to update this user',
        HttpStatus.FORBIDDEN,
      );
    }

    const updatedUser = await this.userService.updateById(id, updateUserDto);
    return {
      message: 'User has been updated successfully',
      data: updatedUser,
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.userService.removeUser(id);
    return {
      message: `User with id ${id} has been removed successfully`,
      data: null,
    };
  }
}
