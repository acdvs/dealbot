import { cx } from '@/lib/utils';

function LoadingDots({ className }: { className?: string }) {
  return (
    <div className={cx('flex gap-1', className)}>
      <div className="size-2 rounded-full bg-white/50 animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]" />
      <div className="size-2 rounded-full bg-white/50 animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_0.5s_infinite]" />
      <div className="size-2 rounded-full bg-white/50 animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_1s_infinite]" />
    </div>
  );
}

export default LoadingDots;
