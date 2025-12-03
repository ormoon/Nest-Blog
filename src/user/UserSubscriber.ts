import {
  EntitySubscriberInterface,
  EventSubscriber,
  SoftRemoveEvent,
} from 'typeorm';
import { User } from './user.entity';
import { Post } from '../post/post.entity';

@EventSubscriber()
export class UserSubscriber implements EntitySubscriberInterface<User> {
  listenTo() {
    return User;
  }

  async afterSoftRemove(event: SoftRemoveEvent<User>) {
    if (!event.entity) {
      return;
    }
    const userId = event.entity.id;

    await event.manager
      .getRepository(Post)
      .softDelete({ author: { id: userId } });
  }
}
