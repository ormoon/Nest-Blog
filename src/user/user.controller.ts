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
} from '@nestjs/common';
import { UserService } from './user.service';
import { UserDto } from './dtos/user.dto';
import { QueryDto } from '../common/dtos/query.dto';
import { LIMIT, PAGE } from '../config/default-value.config';
import { hashPassword } from '../common/utils/bcrypt.util';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from './user.entity';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
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
  @Roles(UserRole.USER)
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const user = await this.userService.findOneById(id);
    return {
      message: 'User retrieved successfully',
      data: user,
    };
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: Partial<UserDto>,
  ) {
    const updatedUser = await this.userService.updateById(id, updateUserDto);
    return {
      message: 'User has been updated successfully',
      data: updatedUser,
    };
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.userService.removeUser(id);
    return {
      message: `User with id ${id} has been removed successfully`,
      data: null,
    };
  }
}
