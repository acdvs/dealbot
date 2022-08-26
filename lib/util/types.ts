import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
} from 'discord.js';
import Bot from '../structures/Bot';

export interface Command {
  options: SlashCommandBuilder;
  run: (interaction: ChatInputCommandInteraction, bot?: Bot) => Promise<void>;
}

export type CommandImport = {
  default: Command;
};

export class BasicEmbed extends EmbedBuilder {
  color = 0xfbab0e;

  constructor(options?: EmbedBuilder['data']) {
    super(options);
    this.setColor(this.color);
  }
}

export interface DealsEmbedOptions {
  game: string;
  gameId: string;
  ix: ChatInputCommandInteraction;
  bot: Bot;
}

export enum TopChartOption {
  WAITLISTED,
  COLLECTED,
  POPULAR,
}

export class APIErrorData {
  embedMessage =
    'Unable to get info from IsThereAnyDeal. Please try again later.';
  code: number;
  message: string;
  path: string;

  constructor(error: Record<string, any>) {
    this.code = error.response.status;
    this.message = error.response.statusText;
    this.path = error.response.request.path;
  }

  toJSON() {
    return {
      code: this.code,
      message: this.message,
      path: this.path,
    };
  }
}

export type GenericFunction = (...params: any) => any;

export type OAuthScope =
  | 'user_info'
  | 'wait_read'
  | 'wait_write'
  | 'coll_read'
  | 'coll_write'
  | 'profile_link';

export interface Payload<T> {
  params: T;
}

export interface AuthorizationPayload {
  client_id: string;
  response_type: 'code' | 'token';
  state: string;
  scope: OAuthScope;
  redirect_url?: string;
}

export interface BaseTokenPayload {
  grant_type: string;
  client_id: string;
  client_secret: string;
}

export interface AccessTokenPayload extends BaseTokenPayload {
  code: string;
  redirect_uri?: string;
}

export interface RefreshTokenPayload extends BaseTokenPayload {
  refresh_token: string;
}

interface ProtectedKeyPayload {
  key: string;
}

interface ProtectedTokenPayload {
  access_token: string;
}

export interface UserInfoPayload {
  access_token: string;
}

export interface RegionsPayload {
  optional: 'names';
}

export interface RegionStoresPayload {
  region: string;
  country?: string;
  optional?: string;
}

export interface SinglePlainPayload extends ProtectedKeyPayload {
  shop?: string;
  game_id?: string;
  url?: string;
  title?: string;
  optional?: 'title';
}

export interface MultiplainPayload extends ProtectedKeyPayload {
  shop: string;
  ids?: string;
}

export interface AllPlainsPayload extends ProtectedKeyPayload {
  shops: string;
}

export interface PlainIDMapPayload extends ProtectedKeyPayload {
  shop: string;
  type?: 'plain:id' | 'id:plain';
}

export interface PricesPayload extends ProtectedKeyPayload {
  plains: string;
  region?: string;
  country?: string;
  shops?: string;
  exclude?: string;
  added?: string;
}

export interface HistoricalLowPayload extends ProtectedKeyPayload {
  plains: string;
  region?: string;
  country?: string;
  shops?: string;
  exclude?: string;
  since?: number;
  until?: number;
  new?: '0' | '1';
}

export interface StoreLowPayload extends ProtectedKeyPayload {
  plains: string;
  region?: string;
  country?: string;
  shops?: string;
  exclude?: string;
}

export interface GameBundlesPayload extends ProtectedKeyPayload {
  plains: string;
  limit?: number;
  expired?: 0 | 1;
  sort?: 'expiry' | 'recent';
  region?: string;
}

export interface GameInfoPayload extends ProtectedKeyPayload {
  plains: string;
  optional?: 'metacritic';
}

export interface GamePricesPayload extends ProtectedKeyPayload {
  region?: string;
  country?: string;
  plains?: string;
  shop?: string;
  ids?: string;
  allowed?: string;
  optional?: string;
}

export interface SearchPayload extends ProtectedKeyPayload {
  q: string;
  limit?: string;
  strict?: '0' | '1';
}

export interface DealsPayload extends ProtectedKeyPayload {
  offset?: string;
  limit?: string;
  region?: string;
  country?: string;
  shops?: string;
  sort?:
    | 'time:asc'
    | 'time:desc'
    | 'price:asc'
    | 'price:desc'
    | 'cut:asc'
    | 'cut:desc'
    | 'expiry:asc'
    | 'expiry:desc';
}

export interface WaitlistCheckPayload extends ProtectedTokenPayload {
  plain: string;
}

export interface WaitlistPayload extends ProtectedTokenPayload {
  shop?: string;
  optional?: string;
}

export type WaitlistImportPayload = ProtectedTokenPayload;

export interface WaitlistDeletePayload extends ProtectedTokenPayload {
  plains?: string;
  shop?: string;
  ids?: string;
}

export interface CollectionCheckPayload extends ProtectedTokenPayload {
  plain: string;
  optional?: string;
}

export interface CollectionPayload extends ProtectedTokenPayload {
  shop?: string;
  short?: string;
  optional?: string;
}

export type CollectionImportPayload = ProtectedTokenPayload;
export type LinkProfilePayload = ProtectedTokenPayload;

export interface WaitlistPriceLimitsPayload extends ProtectedKeyPayload {
  plain: string;
  scale?: number;
  bucket?: number;
  region?: string;
  currency?: string;
}

export interface WaitlistCutLimitsPayload extends ProtectedKeyPayload {
  plain: string;
  bucket?: number;
  region?: string;
}

export interface WaitlistChartPayload extends ProtectedKeyPayload {
  offset?: number;
  limit?: number;
}

export interface CollectionChartPayload extends ProtectedKeyPayload {
  offset?: number;
  limit?: number;
}

export interface PopularityChartPayload extends ProtectedKeyPayload {
  offset?: number;
  limit?: number;
}
