import { SupabaseClient } from '@supabase/supabase-js';

import type { Database as TDatabase } from './types';
import type { APIError } from '@dealbot/api/error';

type DatabaseMember = keyof InstanceType<typeof Database>;
export type DatabaseMethod<Fn extends DatabaseMember> = Awaited<
  ReturnType<Database[Fn]>
>;

export class Database {
  static readonly ITAD_API_ERROR_RECENCY_MIN = 15;

  private readonly client;

  constructor(clientId: string, clientSecret: string) {
    this.client = new SupabaseClient<TDatabase>(clientId, clientSecret);
  }

  async updateGuilds(guildIds: string[]) {
    const guilds = guildIds.map((x) => ({ id: x }));
    const { count, error } = await this.client.from('guilds').upsert(guilds, {
      count: 'estimated',
    });

    if (error) throw error;

    console.log('New guild total:', count);
  }

  async getGuildCount() {
    const { count, error } = await this.client.from('guilds').select('*', {
      count: 'estimated',
    });

    if (error) throw error;

    return count;
  }

  async checkGuilds(guildIds: string[]) {
    const { data, error } = await this.client
      .from('guilds')
      .select('id')
      .in('id', guildIds);

    if (error) throw error;

    return data?.map((x) => x.id);
  }

  async addGuild(guildId: string) {
    const { error } = await this.client.from('guilds').insert({ id: guildId });

    if (error) throw error;
  }

  async deleteGuild(guildId: string) {
    const { error } = await this.client
      .from('guilds')
      .delete()
      .eq('id', guildId);

    if (error) throw error;
  }

  async getCountryCode(guildId: string) {
    const { data, error } = await this.client
      .from('guilds')
      .select('country_code')
      .eq('id', guildId)
      .single();

    if (error || !data.country_code) throw error;

    return data.country_code;
  }

  async saveCountryCode(guildId: string, countryCode: string) {
    const { error } = await this.client
      .from('guilds')
      .update({ country_code: countryCode })
      .eq('id', guildId);

    if (error) throw error;
  }

  async getIgnoredSellers(guildId: string) {
    const { data, error } = await this.client
      .from('ignored_sellers')
      .select('sellers')
      .eq('guild_id', guildId);

    if (error) throw error;

    return data[0]?.sellers || [];
  }

  async saveIgnoredSellers(guildId: string, ignoredSellers: string[]) {
    const { error } = await this.client
      .from('ignored_sellers')
      .upsert({ guild_id: guildId, sellers: ignoredSellers })
      .eq('guild_id', guildId);

    if (error) throw error;

    return true;
  }

  async insertAPIError({ statusCode, message, path }: APIError) {
    const { error } = await this.client.from('api_errors').insert({
      code: statusCode,
      message: message,
      path: path,
    });

    if (error) throw error;
  }

  async hasRecentAPIError() {
    const { data: recentError, error } = await this.client
      .from('api_errors')
      .select()
      .order('timestamp', { ascending: false })
      .limit(1)
      .single();

    if (error) throw error;

    if (!recentError) return false;

    const recencyWindow = Database.ITAD_API_ERROR_RECENCY_MIN * 1000;
    const milliToLastError =
      Date.now() - new Date(recentError.timestamp).getTime();

    return milliToLastError < recencyWindow;
  }
}
