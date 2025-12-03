import { DataSource } from 'typeorm';
import { User, UserRole } from '../user/user.entity';
import { hashPassword } from '../common/utils/bcrypt.util';

export async function createSuperAdmin(ds: DataSource) {
  const user = ds.getRepository(User);

  const superadminPayload: Partial<User> = {
    firstName: 'arjun',
    lastName: 'gautam',
    email: 'arjun.gautam@gmail.com',
    password: await hashPassword('arjun03'),
    role: UserRole.ADMIN,
  };

  const existing = await user.findOne({
    where: { email: superadminPayload.email },
  });

  if (existing) {
    console.log('Super admin already exists.');
    return;
  }

  const admin = user.create(superadminPayload);
  await user.save(admin);

  console.log('Super admin created!');
}
