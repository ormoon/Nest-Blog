import { SelectQueryBuilder } from 'typeorm';
import { User, UserRole } from '../../user/user.entity';
import { Post } from '../../post/post.entity';

export const applyUserAccessFilter = (
  baseQuery: SelectQueryBuilder<Post>,
  currentUser: User,
): SelectQueryBuilder<Post> => {
  if (currentUser.role !== UserRole.ADMIN) {
    baseQuery.andWhere('post.user = :userId', { userId: currentUser.id });
  }
  return baseQuery;
};
