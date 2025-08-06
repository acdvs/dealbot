'use client';

import { useEffect } from 'react';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';

import Select from '@/components/ui/select';

export default function IgnoredSellers({ items }: { items: string[] }) {
  const { control, getValues } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'ignoredSellers',
  });

  const currentValues = getValues('ignoredSellers');

  useEffect(() => {
    if (currentValues.length === 0) {
      append(currentValues);
    }
  }, [append, currentValues]);

  const selectChoices = items
    .filter((x) => !currentValues.includes(x))
    .map((x) => ({ label: x, value: x }));

  return (
    <div>
      <Select
        items={[
          { label: 'Select ignored seller', value: null },
          ...selectChoices,
        ]}
        value={null}
        onValueChange={(x) => append(x)}
        className="mb-2 text-zinc-500 hover:text-foreground transition-colors"
      />
      <div className="flex gap-2 flex-wrap">
        {fields.map((field, idx) => (
          <div
            key={field.id}
            className="group flex items-center gap-2 bg-background-accent pl-4 pr-2 hover:bg-zinc-700 rounded-full cursor-default"
          >
            <Controller
              name={`ignoredSellers.${idx}`}
              render={({ field }) => (
                <div>
                  <span className="pt-[2px] text-sm">{field.value}</span>
                  <input {...field} readOnly hidden />
                </div>
              )}
            />
            <button
              onClick={() => remove(idx)}
              className="p-1 text-zinc-500 group-hover:text-foreground cursor-pointer"
            >
              x
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
