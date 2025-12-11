import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { UserDto } from './dtos/user.dto';
import { QueryDto } from '../common/dtos/query.dto';
import { buildQueryOptions } from '../common/utils/query.util';
import * as csv from 'fast-csv';
import { UserReportFilterDto } from './dtos/userReportFilter.dto';
import { formatHeader } from '../common/utils/headerFormatter';
import { pipeline } from 'stream/promises';
import { PassThrough, Readable } from 'stream';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User, 'postgresConnection')
    private readonly usersRepository: Repository<User>,
  ) {}

  create(user: UserDto): Promise<User> {
    const userData = this.usersRepository.create(user);
    return this.usersRepository.save(userData);
  }

  findAll(query: QueryDto): Promise<[User[], number]> {
    const { perPage, skip, orderBy, order } = buildQueryOptions(query);

    return this.usersRepository
      .createQueryBuilder('user')
      .where(
        'user.firstName LIKE :search OR user.lastName LIKE :search OR user.email LIKE :search',
        {
          search: `%${query.search || ''}%`,
        },
      )
      .orderBy(`user.${orderBy}`, order as 'ASC' | 'DESC')
      .limit(perPage)
      .offset(skip)
      .getManyAndCount();
  }

  async findOneById(id: number): Promise<User | null> {
    const user = await this.usersRepository.findOneBy({ id });

    if (!user)
      throw new HttpException(
        `User with provided id doesn't exist in the system.`,
        HttpStatus.NOT_FOUND,
      );

    return user;
  }

  async getUserPosts(id: number): Promise<User | null> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['posts'],
    });

    if (!user)
      throw new HttpException(
        `User with provided id doesn't exist in the system.`,
        HttpStatus.NOT_FOUND,
      );

    return user;
  }

  async updateById(id: number, userData: Partial<User>): Promise<User> {
    const user = await this.findOneById(id);
    const updated = await this.usersRepository.save({ ...user, ...userData });
    return updated;
  }

  async removeUser(id: number): Promise<void> {
    const user = await this.findOneById(id);
    if (user) await this.usersRepository.softRemove(user);
  }

  async findOneByEmail(email: string): Promise<User | null> {
    return await this.usersRepository.findOneBy({ email });
  }

  // export users, also export based on filter
  async exportUsers(filter?: UserReportFilterDto): Promise<Readable> {
    const queryBuilder = this.usersRepository
      .createQueryBuilder('user')
      .leftJoin('user.posts', 'post')
      .select('user', 'user')
      .addSelect('COUNT(post.author_id)', 'user_totalPosts')
      .where('user.role != :role', { role: 'admin' })
      .groupBy('user.id');

    if (filter?.search) {
      queryBuilder.andWhere(
        'user.firstName ILIKE :search OR user.lastName ILIKE :search',
        { search: `%${filter.search}%` },
      );
    }

    const queryStream = await queryBuilder.stream();

    const headers = [
      'firstName',
      'lastName',
      'email',
      'role',
      'isActive',
      'createdAt',
      'totalPosts',
    ];

    const formatRow = (row: Record<string, any>) =>
      headers.reduce<Record<string, unknown>>((acc, header) => {
        acc[formatHeader(header)] =
          header === 'totalPosts'
            ? Number(row?.[`user_${header}`] ?? 0)
            : (row?.[`user_${header}`] ?? '');
        return acc;
      }, {});

    const csvStream = csv.format({
      headers: headers.map(formatHeader),
    });
    const pass = new PassThrough();

    try {
      await pipeline(
        queryStream,
        async function* (source) {
          for await (const row of source) {
            yield formatRow(row as Record<string, any>);
          }
        },
        csvStream,
        pass,
      );
    } catch (err) {
      console.error('Error >> ', err);
      throw new HttpException(
        'Failed to export users',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return pass;
  }
}
