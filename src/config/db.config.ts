import { DBConfig } from '../common/types/db-config.types';
import { UserSubscriber } from '../user/UserSubscriber';

export default (): { database: DBConfig } => ({
  database: {
    type: 'postgres',
    host: process.env.DB_HOST!,
    port: 5432,
    username: process.env.DB_USERNAME!,
    password: process.env.DB_PASSWORD!,
    database: process.env.DB_NAME!,
    autoLoadEntities: true,
    subscribers: [UserSubscriber],
    synchronize: process.env.NODE_ENV !== 'production',
  },
});
