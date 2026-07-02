import { UsersEntity } from '@/db/entities';
import { getProjectMembers } from '@/lib/db';
import { clerkClient } from '@clerk/nextjs/server';

export interface SpeakerMatch {
  speakerName: string;
  matchedName: string | null;
  matchedUserId: string | null;
}

function normalizeName(name: string): string {
  return name.trim().toLowerCase().replace(/[._-]/g, ' ');
}

function getFirstName(name: string): string {
  const parts = name.trim().split(/\s+/);
  return parts[0]?.toLowerCase() ?? '';
}

function levenshtein(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (a[j - 1] === b[i - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

function nameSimilarity(spoken: string, stored: string): number {
  const spokenNorm = normalizeName(spoken);
  const storedNorm = normalizeName(stored);
  if (!spokenNorm || !storedNorm) return 0;

  const spokenWords = spokenNorm.split(/\s+/);
  const storedWords = storedNorm.split(/\s+/);

  // Only allow substring match for multi-word spoken names (e.g. "Sarah Chen" in "Sarah Chen")
  // For single-word names (e.g. "John"), don't substring-match against full names
  // (prevents "John" matching "Mike Johnson")
  if (spokenWords.length > 1) {
    if (storedNorm.includes(spokenNorm) || spokenNorm.includes(storedNorm)) {
      return 1.0;
    }
  }

  const spokenFirst = getFirstName(spoken);
  const storedFirst = getFirstName(stored);
  if (spokenFirst && storedFirst && spokenFirst === storedFirst) {
    return 0.9;
  }

  if (spokenFirst && storedFirst) {
    const dist = levenshtein(spokenFirst, storedFirst);
    if (dist <= 1 && spokenFirst.length >= 3) return 0.8;
    if (dist <= 2 && spokenFirst.length >= 5) return 0.7;
  }

  // For single-word spoken names, compare against each stored word's first name
  if (spokenWords.length === 1) {
    for (const word of storedWords) {
      if (word === spokenNorm) return 0.95;
    }
  }

  const dist = levenshtein(spokenNorm, storedNorm);
  const maxLen = Math.max(spokenNorm.length, storedNorm.length);
  if (maxLen === 0) return 0;
  return 1 - dist / maxLen;
}

export async function buildSpeakerMap(
  projectId: string | null | undefined,
  speakerNames: string[]
): Promise<Map<string, SpeakerMatch>> {
  const map = new Map<string, SpeakerMatch>();
  const uniqueNames = [...new Set(speakerNames.filter(Boolean))];

  if (!projectId || uniqueNames.length === 0) return map;

  for (const name of uniqueNames) {
    map.set(name, { speakerName: name, matchedName: null, matchedUserId: null });
  }

  try {
    const members = await getProjectMembers(projectId);
    if (members.length === 0) return map;

    const userFetches = members.map(async (m) => {
      const res = await UsersEntity.get({ id: m.user_id }).go();
      let name = res.data?.name ?? '';
      const email = res.data?.email ?? '';

      if (!name) {
        try {
          const client = await clerkClient();
          const clerkUser = await client.users.getUser(m.user_id);
          name = `${clerkUser.firstName ?? ''} ${clerkUser.lastName ?? ''}`.trim();
          if (name) {
            await UsersEntity.update({ id: m.user_id }).set({ name }).go();
          }
        } catch {
          // Clerk lookup failed, skip
        }
      }

      return { userId: m.user_id, name, email };
    });
    const users = await Promise.all(userFetches);
    const validUsers = users.filter((u) => u.name);

    for (const spokenName of uniqueNames) {
      let bestMatch: { userId: string; name: string; score: number } | null = null;

      for (const user of validUsers) {
        const score = nameSimilarity(spokenName, user.name);
        if (score >= 0.7 && (!bestMatch || score > bestMatch.score)) {
          bestMatch = { userId: user.userId, name: user.name, score };
        }
      }

      if (bestMatch) {
        map.set(spokenName, {
          speakerName: spokenName,
          matchedName: bestMatch.name,
          matchedUserId: bestMatch.userId,
        });
      }
    }
  } catch (err) {
    console.error('[speaker-match] Failed to build speaker map:', err);
  }

  return map;
}

export function extractSpeakerNames(transcript: any[]): string[] {
  return transcript
    .map((t: any) => t.speaker_name || t.speaker)
    .filter((s: any): s is string => typeof s === 'string' && s.trim().length > 0);
}
