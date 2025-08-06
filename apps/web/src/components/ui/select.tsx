import { Select } from '@base-ui-components/react/select';
import { RiExpandUpDownLine } from '@remixicon/react';

import { cx } from '@/lib/utils';

type Items = {
  label: string;
  value: string | null;
}[];

function CustomSelect({
  className,
  ...props
}: { className?: string } & React.ComponentProps<typeof Select.Root>) {
  const items = props.items as Items;

  return (
    <Select.Root {...props}>
      <Select.Trigger
        className={cx(
          'flex h-10 xs:w-72 items-center justify-between gap-3 rounded-md bg-background-accent px-3 text-base select-none hover:bg-zinc-700 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-foreground active:bg-zinc-700 data-[popup-open]:bg-zinc-700',
          className
        )}
      >
        <Select.Value className="truncate" />
        <Select.Icon className="flex">
          <RiExpandUpDownLine className="fill-zinc-500 size-5" />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Positioner
          alignItemWithTrigger={false}
          className="outline-none"
          sideOffset={5}
        >
          <Select.Popup className="scrollbar max-h-[300px] w-[calc(100vw-var(--edge-gap)*2)] xs:w-72 group border border-foreground-accent origin-top overflow-y-auto rounded-md bg-background-accent py-1 text-forground transition-[transform,scale,opacity] data-[ending-style]:scale-90 data-[ending-style]:opacity-0 data-[ending-style]:transition-none data-[starting-style]:scale-90 data-[starting-style]:opacity-0 data-[side=none]:data-[starting-style]:scale-100 data-[side=none]:data-[starting-style]:opacity-100 data-[side=none]:data-[starting-style]:transition-none">
            {items.map(({ label, value }) => (
              <Select.Item
                key={value}
                value={value}
                disabled={!value}
                className={cx(
                  'flex justify-between items-center gap-3 px-3 py-1 cursor-default outline-none select-none group-data-[side=none]:max-w-[calc(var(--spacing)*72)] group-data-[side=none]:pr-12 group-data-[side=none]:text-base data-[highlighted]:relative data-[highlighted]:z-0 data-[highlighted]:before:absolute data-[highlighted]:before:inset-x-1 data-[highlighted]:before:inset-y-0 data-[highlighted]:before:z-[-1] data-[highlighted]:before:rounded-sm',
                  value
                    ? 'data-[highlighted]:text-foreground data-[highlighted]:before:bg-zinc-700'
                    : 'text-foreground-accent'
                )}
              >
                <Select.ItemText className="truncate">{label}</Select.ItemText>
              </Select.Item>
            ))}
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  );
}

export default CustomSelect;
