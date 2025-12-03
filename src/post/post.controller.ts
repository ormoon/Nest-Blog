import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PostService } from './post.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { User, UserRole } from '../user/user.entity';
import { PostDto } from './dtos/post.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { QueryDto } from '../common/dtos/query.dto';
import { LIMIT, PAGE } from '../config/default-value.config';

@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.USER)
  async create(@Body() createPostDto: PostDto) {
    const post = await this.postService.createPost(createPostDto);
    return {
      message: 'Post has been created successfully',
      data: post,
    };
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  async findAll(@Query() query: QueryDto, @CurrentUser() currentUser: User) {
    const [posts, totalData] = await this.postService.findAll(
      query,
      currentUser,
    );
    const { limit = LIMIT, page = PAGE } = query;
    const totalPages = Math.ceil(totalData / +limit);
    return {
      message: 'Posts retrieved successfully',
      data: posts,
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
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: User,
  ) {
    const post = await this.postService.findOneById(id, currentUser);
    return {
      message: 'Post retrieved successfully',
      data: post,
    };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePostDto: Partial<Omit<PostDto, 'author'>>,
    @CurrentUser() currentUser: User,
  ) {
    const updatedPost = await this.postService.updateById(
      id,
      updatePostDto,
      currentUser,
    );
    return {
      message: 'post has been updated successfully',
      data: updatedPost,
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.USER)
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: User,
  ) {
    await this.postService.removePost(id, currentUser);
    return {
      message: `Post with id ${id} has been removed successfully`,
      data: null,
    };
  }
}
