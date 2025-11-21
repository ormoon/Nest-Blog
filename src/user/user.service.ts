import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { UserDto } from './dtos/user.dto';
import { QueryDto } from '../common/dtos/query.dto';
import { buildQueryOptions } from '../common/utils/query.util';
import { isNumberString } from '../common/utils/validation.util';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User, 'postgresConnection')
    private readonly usersRepository: Repository<User>,
  ) {}

  create(user: UserDto): Promise<User> {
    const useData = this.usersRepository.create(user);
    return this.usersRepository.save(useData);
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

  async findByIdOrEmail(value: string): Promise<User | null> {
    const isId: boolean = isNumberString(value);
    const query = isId ? { id: Number(value) } : { email: value };

    const user = await this.usersRepository.findOneBy(query);

    if (!user)
      throw new HttpException(
        `User with provided ${isId ? 'id' : 'email'} doesn't exist in the system.`,
        HttpStatus.NOT_FOUND,
      );
    return user;
  }

  async updateById(id: string, userData: Partial<User>): Promise<User> {
    const user = await this.findByIdOrEmail(id);
    const updated = await this.usersRepository.save({ ...user, ...userData });
    return updated;
  }

  async removeUser(id: string): Promise<void> {
    await this.findByIdOrEmail(id);
    await this.usersRepository.softDelete(id);
  }
}
