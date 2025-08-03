import Link from 'next/link';
import { RiGithubFill } from '@remixicon/react';

import { cx } from '@/lib/utils';

function Footer({ className }: { className?: string }) {
  return (
    <div
      className={cx(
        'pt-3 mt-15 mb-10 flex justify-between border-t-1 border-foreground-accent text-foreground-accent',
        className
      )}
    >
      <p>Not affiliated with IsThereAnyDeal</p>
      <Link
        href="https://github.com/acdvs/dealbot"
        rel="nofollow"
        target="_blank"
        className="flex items-center gap-1 hover:text-foreground transition-colors"
      >
        <RiGithubFill className="size-6 stroke-3" />
        GitHub
      </Link>
    </div>
  );
}

export default Footer;
