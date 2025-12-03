import { DataSource } from 'typeorm';
import { SeederDataSource } from './data-source';
import { createSuperAdmin } from './superadmin.seeder';

async function run() {
  let ds: DataSource | null = null;
  try {
    ds = await SeederDataSource.initialize();
    console.log('DB connected For Seeding');

    await createSuperAdmin(ds);

    console.log('Seeding completed');
  } catch (e) {
    console.error('Seeding Failed >> ', e);
  } finally {
    if (ds) await ds.destroy();
  }
}

void run();
