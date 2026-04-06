'use client';

import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';
import { getGuilds } from '@/actions/discord/user-api';
import ErrorState from '@/components/state/error';
import Skeleton from '@/components/ui/skeleton';
import { cx } from '@/lib/utils';
import Grid from './grid';

function GuildSelector() {
  const { data, isPending, isError } = useQuery({
    queryKey: ['guilds'],
    queryFn: getGuilds,
  });

  if (isPending) {
    return (
      <Grid>
        {Array(6).map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: Items not unique
          <Guild key={i}>
            <Skeleton className="size-11.25 rounded-2xl" />
            <Skeleton className="w-24 h-3 rounded-full" />
          </Guild>
        ))}
      </Grid>
    );
  }

  if (isError) {
    return (
      <ErrorState
        label="Unable to get servers. Please try again later."
        className="h-40"
      />
    );
  }

  return (
    <Grid>
      {data.map((guild) => (
        <Link
          key={guild.id}
          href={guild.joined ? `/dashboard/${guild.id}` : '/invite'}
        >
          <Guild className="group justify-between rounded-xl border border-transparent hover:border-foreground/30 active:border-foreground/30 transition-colors">
            <div className="flex items-center gap-3 overflow-hidden">
              <GuildIcon {...guild} />
              <p className="text-center truncate" title={guild.name}>
                {guild.name}
              </p>
            </div>
          </Guild>
        </Link>
      ))}
    </Grid>
  );
}

function Guild({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cx('p-2 flex items-center gap-4', className)}>
      {children}
    </div>
  );
}

function GuildIcon({
  icon,
  id,
  name,
}: {
  icon: string | null;
  id: string;
  name: string;
}) {
  if (!icon) {
    return (
      <div className="size-11.25 flex justify-center items-center text-2xl">
        {name[0].toUpperCase()}
      </div>
    );
  }

  return (
    <Image
      src={`https://cdn.discordapp.com/icons/${id}/${icon}.webp`}
      height={45}
      width={45}
      alt="guild icon"
      className="size-11.25 rounded-xl"
    />
  );
}

export default GuildSelector;
