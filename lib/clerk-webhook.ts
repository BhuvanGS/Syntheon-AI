import { clerkClient } from '@clerk/nextjs/server';
import { UsersEntity, OrganizationMetadataEntity } from '@/db/entities';
import { isPublicDomainEmail, generatePersonalOrgName } from '@/lib/org-utils';
import { randomUUID } from 'crypto';

export async function handleClerkWebhook(evt: any) {
  if (evt.type === 'user.created') {
    const { id, email_addresses, first_name, last_name } = evt.data;
    const email = email_addresses[0]?.email_address ?? '';
    const name = `${first_name ?? ''} ${last_name ?? ''}`.trim() || 'User';

    const existing = await UsersEntity.get({ id }).go();
    if (!existing.data) {
      await UsersEntity.create({ id, email, name, plan: 'starter' }).go();
    }

    console.log('[webhook] User created in DB:', id, email);

    if (email && isPublicDomainEmail(email)) {
      await createPersonalOrg(id, email, name);
    }
  }

  if (evt.type === 'organization.created') {
    const { id, name } = evt.data;
    const existing = await OrganizationMetadataEntity.get({ orgId: id }).go();
    if (!existing.data) {
      await OrganizationMetadataEntity.create({
        id: randomUUID(),
        orgId: id,
        companyName: null,
        managerName: null,
        allowAccessRequests: false,
      }).go();
    }

    console.log('[webhook] Organization metadata created:', id, name);
  }

  if (evt.type === 'organizationMembership.created') {
    const { organization, public_user_data, role } = evt.data;
    console.log(
      '[webhook] Org membership created:',
      organization.id,
      public_user_data.user_id,
      role
    );
  }
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function createPersonalOrg(userId: string, email: string, userDisplayName?: string) {
  const client = await clerkClient();
  const baseName = generatePersonalOrgName(email, userDisplayName);

  for (let attempt = 0; attempt < 8; attempt += 1) {
    if (attempt > 0) await sleep(2000);

    const name = attempt === 0 ? baseName : `${baseName}-${attempt}`;
    try {
      const org = await client.organizations.createOrganization({
        name,
        createdBy: userId,
      });

      await OrganizationMetadataEntity.create({
        id: randomUUID(),
        orgId: org.id,
        companyName: null,
        managerName: null,
        allowAccessRequests: false,
        trialStartedAt: new Date().toISOString(),
      }).go();

      console.log('[webhook] Personal org created:', org.id, name);
      return;
    } catch (err: any) {
      const code = err?.errors?.[0]?.code ?? '';

      if (code === 'organization_creator_not_found') {
        console.log(`[webhook] User not propagated yet, retry ${attempt + 1}/8...`);
        continue;
      }

      if (code === 'form_identifier_exists' || code === 'duplicate_record') {
        continue;
      }

      console.error('[webhook] Failed to create personal org:', {
        status: err?.status,
        code,
        message: err?.errors?.[0]?.longMessage ?? err?.message,
        name,
        userId,
      });
      return;
    }
  }

  console.error('[webhook] Exhausted attempts for personal org:', baseName);
}
