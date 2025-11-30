import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './post.entity';
import { PostDto } from './dtos/post.dto';
import { buildQueryOptions } from '../common/utils/query.util';
import { QueryDto } from '../common/dtos/query.dto';
import { User } from '../user/user.entity';
import { applyUserAccessFilter } from '../common/utils/post.utils';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post, 'postgresConnection')
    private readonly postRepository: Repository<Post>,
  ) {}

  createPost(postData: PostDto): Promise<Post> {
    const { author, ...rest } = postData;
    const newPost = this.postRepository.create({
      ...rest,
      author: { id: author },
    });
    return this.postRepository.save(newPost);
  }

  findAll(query: QueryDto, currentUser: User): Promise<[Post[], number]> {
    const { perPage, skip, orderBy, order } = buildQueryOptions(query);

    // if current user is admin, show all posts including others, else show only his posts
    const baseQuery = this.postRepository
      .createQueryBuilder('post')
      .where('post.title LIKE :search OR post.status LIKE :search', {
        search: `%${query.search || ''}%`,
      });

    applyUserAccessFilter(baseQuery, currentUser);

    return baseQuery
      .orderBy(`post.${orderBy}`, order as 'ASC' | 'DESC')
      .limit(perPage)
      .offset(skip)
      .getManyAndCount();
  }

  async findOneById(id: number, currentUser: User): Promise<Post | null> {
    const baseQuery = this.postRepository
      .createQueryBuilder('post')
      .where('post.id = :id', { id });

    applyUserAccessFilter(baseQuery, currentUser);

    const post = await baseQuery.getOne();

    if (!post)
      throw new HttpException(
        `Post with provided id doesn't exist or you don't have access.`,
        HttpStatus.NOT_FOUND,
      );

    return post;
  }

  async updateById(
    id: number,
    postData: Partial<Post>,
    currentUser: User,
  ): Promise<Post> {
    const post = await this.findOneById(id, currentUser);
    const updated = await this.postRepository.save({ ...post, ...postData });
    return updated;
  }

  async removePost(id: number, currentUser: User): Promise<void> {
    const post = await this.findOneById(id, currentUser);
    post!.deletedBy = currentUser;
    await this.postRepository.softDelete(id);
  }
}
