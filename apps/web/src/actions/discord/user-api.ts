'use server';

import {
  RESTGetAPICurrentUserGuildsResult,
  RESTGetAPICurrentUserResult,
  RESTGetAPIGuildResult,
} from 'discord.js';

import { api } from './user-client';
import { db } from '@/lib/database';
import { userIsGuildAdmin } from '@/lib/utils';

export async function getUser() {
  const res = await api.get<RESTGetAPICurrentUserResult>('/users/@me');
  return res.data;
}

export async function getGuilds() {
  try {
    const res = await api.get<RESTGetAPICurrentUserGuildsResult>(
      '/users/@me/guilds'
    );

    const adminGuilds = res.data.filter((x) => userIsGuildAdmin(x.permissions));
    const guildIds = adminGuilds.map((x) => x.id);

    const joinedGuilds = await db.checkGuilds(guildIds);

    return adminGuilds.map((x) => ({
      ...x,
      joined: joinedGuilds?.includes(x.id),
    }));
  } catch (error) {
    console.error(error);
  }

  return [];
}

export async function getGuild(id: string) {
  const res = await api.get<RESTGetAPIGuildResult>(`/guilds/${id}`);
  return res.data;
}
