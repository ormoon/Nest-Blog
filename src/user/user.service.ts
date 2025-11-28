import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { UserDto } from './dtos/user.dto';
import { QueryDto } from '../common/dtos/query.dto';
import { buildQueryOptions } from '../common/utils/query.util';

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

  async updateById(id: number, userData: Partial<User>): Promise<User> {
    const user = await this.findOneById(id);
    const updated = await this.usersRepository.save({ ...user, ...userData });
    return updated;
  }

  async removeUser(id: number): Promise<void> {
    await this.findOneById(id);
    await this.usersRepository.softDelete(id);
  }

  async findOneByEmail(email: string): Promise<User | null> {
    return await this.usersRepository.findOneBy({ email });
  }
}
