import { UsersEntity } from '@/db/entities';

export async function ensureUser(userId: string, email: string, name?: string) {
  const existing = await UsersEntity.get({ id: userId }).go();

  if (existing.data) {
    if (name && !existing.data.name) {
      await UsersEntity.update({ id: userId }).set({ name }).go();
      console.log('User name updated:', name);
    }
    return;
  }

  try {
    await UsersEntity.create({ id: userId, email, name: name || 'User', plan: 'starter' }).go();
    console.log('User created:', name || 'User');
  } catch (err) {
    console.error('ensureUser insert failed:', err);
    throw err;
  }
}
