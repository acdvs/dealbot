'use server';

import { db } from '@/lib/database';

export async function getGuildSettings(guildId: string) {
  const [countryCode, ignoredSellers] = await Promise.all([
    db.getCountryCode(guildId),
    db.getIgnoredSellers(guildId),
  ]);

  return {
    countryCode,
    guildId,
    ignoredSellers,
  };
}

export async function saveGuildSettings({
  guildId,
  countryCode,
  ignoredSellers,
}: {
  guildId: string;
  countryCode: string;
  ignoredSellers: string[];
}) {
  await Promise.all([
    db.saveCountryCode(guildId, countryCode),
    db.saveIgnoredSellers(guildId, ignoredSellers),
  ]);
}
