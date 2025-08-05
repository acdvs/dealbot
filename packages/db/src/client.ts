import { SupabaseClient } from '@supabase/supabase-js';

import { APIError } from '@dealbot/api/error';
import type { Database as TDatabase } from './types';

export class Database extends SupabaseClient<TDatabase> {
  async updateGuildCount(guildIds: Record<'id', string>[]) {
    const { count, error } = await this.from('guilds').insert(guildIds, {
      count: 'estimated',
    });

    if (error) throw error;

    console.log('Total guilds created:', count);
  }

  async getGuildCount() {
    const { count, error } = await this.from('guilds').select('*', {
      count: 'estimated',
    });

    if (error) throw error;

    return count;
  }

  async checkGuilds(guildIds: string[]) {
    const { data, error } = await this.from('guilds')
      .select('id')
      .in('id', guildIds);

    if (error) throw error;

    return data?.map((x) => x.id);
  }

  async addGuild(guildId: string) {
    const { error } = await this.from('guilds').insert({ id: guildId });

    if (error) throw error;
  }

  async deleteGuild(guildId: string) {
    const { error } = await this.from('guilds').delete().eq('id', guildId);

    if (error) throw error;
  }

  async getCountryCode(guildId: string) {
    const { data, error } = await this.from('guilds')
      .select('country_code')
      .eq('id', guildId)
      .single();

    if (error || !data.country_code) throw error;

    return data.country_code;
  }

  async saveCountryCode(guildId: string, countryCode: string) {
    const { error } = await this.from('guilds')
      .update({ country_code: countryCode })
      .eq('id', guildId);

    if (error) throw error;
  }

  async getIgnoredSellers(guildId: string) {
    const { data, error } = await this.from('ignored_sellers')
      .select('sellers')
      .eq('guild_id', guildId);

    if (error) throw error;

    return data[0]?.sellers || [];
  }

  async saveIgnoredSellers(guildId: string, ignoredSellers: string[]) {
    const { error } = await this.from('ignored_sellers')
      .upsert({ guild_id: guildId, sellers: ignoredSellers })
      .eq('guild_id', guildId);

    if (error) throw error;

    return true;
  }

  async insertAPIError({ statusCode, message, path }: APIError) {
    const { error } = await this.from('api_errors').insert({
      code: statusCode,
      message: message,
      path: path,
    });

    if (error) throw error;
  }

  async hasRecentAPIError() {
    const { data: recentError, error } = await this.from('api_errors')
      .select()
      .order('timestamp', { ascending: false })
      .limit(1)
      .single();

    if (error) throw error;

    if (!recentError) return false;

    const recencyWindow =
      Number(process.env.ITAD_API_ERROR_RECENCY_WINDOW_MIN) * 1000;
    const milliToLastError =
      Date.now() - new Date(recentError.timestamp).getTime();

    return milliToLastError < recencyWindow;
  }
}
