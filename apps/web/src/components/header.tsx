import Image from 'next/image';

import { cx } from '@/lib/utils';

async function Header({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cx(
        'flex justify-between items-center gap-5 pt-5 mb-5 sm:mb-10',
        className
      )}
    >
      <div className="flex gap-2">
        <Image src="/avatar.png" width={50} height={50} alt="bot avatar" />
        <div className="flex flex-col justify-center">
          <h1 className="mb-0 leading-6 max-xs:w-40">IsThereAnyDeal Lookup</h1>
          <p className="text-zinc-500 text-lg leading-none max-xs:hidden">
            Watching <strong>for /deals</strong>
          </p>
        </div>
      </div>
      {children}
    </header>
  );
}

export default Header;
