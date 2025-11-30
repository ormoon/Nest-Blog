import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../user/user.entity';

export enum PostStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

@Entity()
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  //TODO: add category entity later
  @Column({ nullable: true })
  category: string;

  @Column()
  title: string;

  @Column({ unique: true })
  slug: string;

  @Column('text')
  content: string;

  @Column({ nullable: true })
  summary: string;

  @ManyToOne(() => User, (user) => user.posts)
  author: User;

  @Column({ type: 'enum', enum: PostStatus, default: PostStatus.DRAFT })
  status: PostStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @ManyToOne(() => User, (user) => user.posts, { nullable: true })
  deletedBy: User;
}
