'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';

import Grid from './grid';
import { getGuilds } from '@/actions/discord/user-api';
import Skeleton from '@/components/ui/skeleton';
import ErrorState from '@/components/state/error';
import { cx } from '@/lib/utils';

function GuildSelector() {
  const { data, isPending, isError } = useQuery({
    queryKey: ['guilds'],
    queryFn: getGuilds,
  });

  if (isPending) {
    return (
      <Grid>
        {Array(6)
          .fill(0)
          .map((_, i) => (
            <Guild key={i}>
              <Skeleton className="size-[45px] rounded-2xl" />
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
        <Link key={guild.id} href={`/dashboard/${guild.id}`}>
          <Guild className="group justify-between rounded-xl border-1 border-transparent hover:border-foreground/30 active:border-foreground/30 transition-colors">
            <div className="flex items-center gap-3 overflow-hidden">
              <Image
                src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.webp`}
                height={45}
                width={45}
                alt="guild icon"
                className="size-[45px] rounded-xl"
              />
              <p className="text-center truncate" title={guild.name}>
                {guild.name}
              </p>
            </div>
            {guild.joined && (
              <Image
                src="/avatar.png"
                height={20}
                width={20}
                alt="joined guild"
                className="grayscale group-hover:grayscale-0 group-active:grayscale-0 transition-all"
              />
            )}
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

export default GuildSelector;
