import { EntitySubscriberInterface } from 'typeorm';

export interface DBConfig {
  type: 'postgres';
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  autoLoadEntities: boolean;
  subscribers: Array<
    new (...args: any[]) => EntitySubscriberInterface<any> | string
  >;
  synchronize: boolean;
}
