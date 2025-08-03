import { redirect, RedirectType } from 'next/navigation';

import SettingsForm from './_components/guild-settings-form';
import { getGuilds } from '@/actions/discord/user-api';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

export default async function GuildPage({
  params,
}: {
  params: Promise<{ guildId: string }>;
}) {
  const { guildId } = await params;

  const guilds = await getGuilds();
  const guild = guilds.find((x) => x.id === guildId);

  if (!guild) {
    redirect('/', RedirectType.replace);
  }

  return (
    <>
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
    </>
  );
}
