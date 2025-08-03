import { cx } from '@/lib/utils';
import { RiLoader4Line } from '@remixicon/react';

function LoadingState({
  className,
  label,
}: {
  className?: string;
  label?: string;
}) {
  return (
    <div
      className={cx(
        'flex flex-col justify-center items-center gap-3',
        className
      )}
    >
      <RiLoader4Line className="size-10 animate-spin" />
      {label && <p className="text-foreground-accent">{label}</p>}
    </div>
  );
}

export default LoadingState;
