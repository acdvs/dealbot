import { cx } from '@/lib/utils';

function Button({ className, ...props }: React.ComponentProps<'button'>) {
  return (
    <button
      {...props}
      className={cx(
        'px-4 py-2 flex items-center bg-blurple hover:bg-blurple/70 rounded-lg gap-2 cursor-pointer transition-colors disabled:opacity-70 disabled:hover:bg-blurple',
        className
      )}
    />
  );
}

export default Button;
