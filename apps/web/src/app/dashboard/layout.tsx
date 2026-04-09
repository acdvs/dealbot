import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { getGuilds } from '@/actions/discord/user-api';
import Footer from '@/components/footer';
import Header from '@/components/header';
import UserMenu from '@/components/user-menu';
import { getQueryClient } from '@/lib/query-client';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: ['guilds'],
    queryFn: getGuilds,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div>
        <Header>
          <UserMenu />
        </Header>
        {children}
        <Footer />
      </div>
    </HydrationBoundary>
  );
}
