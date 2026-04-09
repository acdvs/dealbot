import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { RedirectType, redirect } from 'next/navigation';
import { getGuilds } from '@/actions/discord/user-api';
import { getGuildSettings } from '@/actions/guild';
import { getSellers } from '@/actions/itad-api';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { getQueryClient } from '@/lib/query-client';
import SettingsForm from './_components/guild-settings-form';

export default async function GuildPage({
  params,
}: {
  params: Promise<{ guildId: string }>;
}) {
  const { guildId } = await params;
  const queryClient = getQueryClient();

  const guilds = await queryClient.fetchQuery({
    queryKey: ['guilds'],
    queryFn: getGuilds,
  });

  const guild = guilds?.find((x) => x.id === guildId);

  if (!guild || !guild.joined) {
    redirect('/', RedirectType.replace);
  }

  await queryClient.prefetchQuery({
    queryKey: ['guild-settings', guildId],
    queryFn: async () => getGuildSettings(guildId),
  });

  await queryClient.prefetchQuery({
    queryKey: ['sellers'],
    queryFn: getSellers,
    staleTime: 1000 * 60 * 60 * 24,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <title>{`Dealbot | ${guild.name}`}</title>
      <Breadcrumb className="mb-2">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Server Settings</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <h1 className="mb-5 sm:mb-10">{guild.name}</h1>
      <SettingsForm guildId={guildId} />
    </HydrationBoundary>
  );
}
