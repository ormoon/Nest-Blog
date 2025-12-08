import { User } from '../../user/user.entity';

export interface UserWithGroups extends User {
  _groups?: string[];
}
