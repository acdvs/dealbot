import { cx } from '@/lib/utils';

function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cx('bg-background-accent animate-pulse', className)} />
  );
}

export default Skeleton;
