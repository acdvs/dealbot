import { Metadata } from 'next';
import GuildSelector from './_components/guild-selector';

export const metadata: Metadata = {
  title: 'Dashboard',
};

export default async function Dashboard() {
  return (
    <div>
      <div className="pb-4 mb-3 border-b-1 border-foreground-accent">
        <h1>Select a server</h1>
        <p className="text-foreground-accent">
          Only servers where you have the admin permission are shown.
        </p>
      </div>
      <GuildSelector />
    </div>
  );
}
