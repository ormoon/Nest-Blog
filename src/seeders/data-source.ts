import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import configList from '../config';
import { User } from '../user/user.entity';
import { UserSubscriber } from '../user/UserSubscriber';
import { Post } from '../post/post.entity';

// Load .env manually (required for standalone scripts)
dotenv.config();

const dbConfig = configList[0]().database;

export const SeederDataSource = new DataSource({
  ...dbConfig,
  entities: [User, Post],
  subscribers: [UserSubscriber],
});
