import { randomUUID } from 'crypto';
import { OrganizationMetadataEntity } from '@/db/entities';

/** Matches public trial copy (legal, FAQ, docs). */
export const ORG_TRIAL_DAYS = 7;

export type OrgTrialStatus = {
  trialStartedAt: string | null;
  daysLeft: number;
  expired: boolean;
  trialDays: number;
};

function computeTrial(trialStartedAt: string | null): OrgTrialStatus {
  if (!trialStartedAt) {
    return {
      trialStartedAt: null,
      daysLeft: 0,
      expired: true,
      trialDays: ORG_TRIAL_DAYS,
    };
  }

  const startDate = new Date(trialStartedAt);
  if (Number.isNaN(startDate.getTime())) {
    return {
      trialStartedAt,
      daysLeft: 0,
      expired: true,
      trialDays: ORG_TRIAL_DAYS,
    };
  }

  const elapsedDays = Math.floor((Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const daysLeft = Math.max(0, ORG_TRIAL_DAYS - elapsedDays);
  const expired = daysLeft <= 0;

  return {
    trialStartedAt,
    daysLeft: expired ? 0 : daysLeft,
    expired,
    trialDays: ORG_TRIAL_DAYS,
  };
}

export async function getOrgTrialStatus(
  orgId: string,
  opts: { ensure?: boolean } = {}
): Promise<OrgTrialStatus> {
  const res = await OrganizationMetadataEntity.get({ orgId }).go();
  let trialStartedAt = res.data?.trialStartedAt ?? null;

  if (!trialStartedAt && opts.ensure) {
    trialStartedAt = new Date().toISOString();
    if (!res.data) {
      try {
        await OrganizationMetadataEntity.create({
          id: randomUUID(),
          orgId,
          trialStartedAt,
        }).go();
      } catch {
        const again = await OrganizationMetadataEntity.get({ orgId }).go();
        trialStartedAt = again.data?.trialStartedAt ?? trialStartedAt;
      }
    } else {
      await OrganizationMetadataEntity.update({ orgId })
        .set({ trialStartedAt, updatedAt: trialStartedAt })
        .go();
    }
  }

  return computeTrial(trialStartedAt);
}
