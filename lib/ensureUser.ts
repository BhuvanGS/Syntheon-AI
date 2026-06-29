import { UsersEntity } from '@/db/entities';

export async function ensureUser(userId: string, email: string) {
  const existing = await UsersEntity.get({ id: userId }).go();

  if (existing.data) {
    console.log('User exists (by ID)');
    return;
  }

  try {
    await UsersEntity.create({ id: userId, email, plan: 'starter' }).go();
    console.log('User created');
  } catch (err) {
    console.error('ensureUser insert failed:', err);
    throw err;
  }
}
