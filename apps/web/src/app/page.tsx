import Link from 'next/link';

import Button from '@/components/ui/button';
import Header from '@/components/header';
import Footer from '@/components/footer';

export default async function Index() {
  return (
    <div className="h-screen flex flex-col">
      <Header>
        <Link href="/session/login" rel="nofollow">
          <Button className="xs:gap-1">
            Login<span className="max-sm:hidden">With Discord</span>
          </Button>
        </Link>
      </Header>
      <main className="max-sm:h-full flex flex-col justify-center items-center gap-5 sm:my-25">
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/invite" rel="nofollow">
            <Button>Add To Server</Button>
          </Link>
        </div>
        <p className="text-center border-b-1 border-foreground-accent pb-5">
          A Discord bot for looking up PC game deals via IsThereAnyDeal.
        </p>
        <p className="sm:w-1/2 text-center">
          Get game deals, regular pricing, Steam user review scores, historical
          lows, and more, all with a single command.
        </p>
      </main>
      <Footer />
    </div>
  );
}
