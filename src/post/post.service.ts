import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './post.entity';
import { PostDto } from './dtos/post.dto';

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
}
