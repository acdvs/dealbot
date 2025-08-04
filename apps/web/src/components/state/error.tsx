import { cx } from '@/lib/utils';
import { RiErrorWarningLine } from '@remixicon/react';

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
        className
      )}
    >
      <RiErrorWarningLine />
      {label && <p>{label}</p>}
    </div>
  );
}

export default ErrorState;
