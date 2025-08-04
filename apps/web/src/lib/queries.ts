import { getGuildSettings } from '@/actions/guild';
import { getSellers } from '@dealbot/api/requests';

type Sellers = Awaited<ReturnType<typeof getSellers>>;

const sellers = {
  queryKey: ['sellers'],
  queryFn: getSellers,
  staleTime: 1000 * 60 * 60,
  select: (x: Sellers) => x.map((y) => y.title),
};

const guildSettings = (guildId: string) => ({
  queryKey: ['guild', guildId],
  queryFn: () => getGuildSettings(guildId),
});

export default { guildSettings, sellers };
