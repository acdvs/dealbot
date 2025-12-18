import { RiErrorWarningLine } from '@remixicon/react';
import { cx } from '@/lib/utils';

function ErrorState({
  className,
  label,
}: {
  className?: string;
  label?: string;
}) {
  return (
    <div
      className={cx(
        'flex justify-center items-center gap-2 text-destructive',
        className,
      )}
    >
      <RiErrorWarningLine />
      {label && label}
    </div>
  );
}

export default ErrorState;
