'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Menu } from '@base-ui-components/react/menu';
import { useQuery } from '@tanstack/react-query';

import { getUser } from '@/actions/discord/user-api';
import Skeleton from './ui/skeleton';

function UserMenu() {
  const { data: user, isLoading } = useQuery({
    queryKey: ['user'],
    queryFn: getUser,
  });

  if (isLoading) {
    return <Skeleton className="size-[50px] rounded-full" />;
  }

  if (!user) {
    return null;
  }

  return (
    <Menu.Root>
      <Menu.Trigger className="flex items-center gap-2">
        <p className="max-w-36 truncate hidden sm:block" title={user.username}>
          {user.username}
        </p>
        <Image
          src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.webp`}
          height={50}
          width={50}
          alt="user avatar"
          className="rounded-full shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
        />
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Backdrop />
        <Menu.Positioner align="end">
          <Menu.Popup className="mt-3 py-1 px-1 w-36 bg-background-accent rounded-lg origin-top transition-[transform,scale,opacity] data-[ending-style]:scale-90 data-[ending-style]:opacity-0 data-[starting-style]:scale-90 data-[starting-style]:opacity-0">
            <p className="px-3 py-1 text-zinc-400 sm:hidden">{user.username}</p>
            <Menu.Item className="hover:bg-zinc-700 rounded">
              <Link href="/dashboard" className="block px-3 py-1">
                Servers
              </Link>
            </Menu.Item>
            <Menu.Separator className="w-full h-px my-1 bg-foreground-accent" />
            <Menu.Item className="hover:bg-zinc-700 rounded">
              <Link href="/session/logout" className="block px-3 py-1">
                Logout
              </Link>
            </Menu.Item>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}

export default UserMenu;
