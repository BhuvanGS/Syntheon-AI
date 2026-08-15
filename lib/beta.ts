const DEFAULT_BETA_DURATION_DAYS = 15;

function parseBoolean(value: string | undefined): boolean {
  if (!value) return false;
  return ['1', 'true', 'yes', 'on'].includes(value.trim().toLowerCase());
}

function parseDate(value: string | undefined): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export interface BetaStatus {
  enabled: boolean;
  startAt: Date | null;
  endAt: Date | null;
  durationDays: number;
  isActive: boolean;
  isExpired: boolean;
  remainingMs: number;
}

export function getBetaStatus(now = new Date()): BetaStatus {
  const enabled = parseBoolean(process.env.BETA_MODE ?? process.env.NEXT_PUBLIC_BETA_MODE);
  const startAt = parseDate(process.env.BETA_START_AT ?? process.env.NEXT_PUBLIC_BETA_START_AT);

  const durationRaw = process.env.BETA_DURATION_DAYS ?? process.env.NEXT_PUBLIC_BETA_DURATION_DAYS;
  const durationParsed = Number.parseInt(durationRaw ?? '', 10);
  const durationDays =
    Number.isFinite(durationParsed) && durationParsed > 0
      ? durationParsed
      : DEFAULT_BETA_DURATION_DAYS;

  if (!enabled || !startAt) {
    return {
      enabled,
      startAt,
      endAt: startAt,
      durationDays,
      isActive: false,
      isExpired: false,
      remainingMs: 0,
    };
  }

  const endAt = new Date(startAt.getTime() + durationDays * 24 * 60 * 60 * 1000);
  const remainingMs = endAt.getTime() - now.getTime();

  return {
    enabled,
    startAt,
    endAt,
    durationDays,
    isActive: now >= startAt && remainingMs > 0,
    isExpired: now >= endAt,
    remainingMs: Math.max(0, remainingMs),
  };
}

export function isBetaActive(now = new Date()): boolean {
  return getBetaStatus(now).isActive;
}

export function isBetaExpired(now = new Date()): boolean {
  const status = getBetaStatus(now);
  return status.enabled && status.isExpired;
}
