'use client';

import { Field } from '@base-ui/react/field';
import {
  Controller,
  type FieldArrayWithId,
  type FieldValues,
  type UseFieldArrayAppend,
  type UseFieldArrayRemove,
  useFieldArray,
  useFormContext,
} from 'react-hook-form';
import Select from '@/components/ui/select';
import useSellers from '../_hooks/use-sellers';

function IgnoredSellers() {
  const { fields, append, remove } = useFieldArray({
    name: 'ignoredSellers',
  });

  return (
    <Field.Root>
      <div className="flex justify-between">
        <div className="mb-2">
          <Field.Label className="leading-none">Ignored sellers</Field.Label>
          <Field.Description className="text-foreground-accent leading-none mb-2">
            Hides sellers from all results
          </Field.Description>
        </div>
        <IgnoredSellersSelect append={append} />
      </div>
      <IgnoredSellersSelected fields={fields} remove={remove} />
    </Field.Root>
  );
}

function IgnoredSellersSelect({
  append,
}: {
  append: UseFieldArrayAppend<FieldValues>;
}) {
  const { getValues } = useFormContext();
  const sellers = useSellers();

  const currentValues = getValues('ignoredSellers');

  const unselectedOptions = sellers
    .filter((x) => !currentValues.includes(x))
    .map((x) => ({ label: x, value: x }));

  return (
    <Select
      items={[
        { label: 'Select ignored seller', value: null },
        ...unselectedOptions,
      ]}
      value={null}
      onValueChange={(x) => append(x)}
      className="mb-2 text-zinc-500 hover:text-foreground transition-colors"
    />
  );
}

function IgnoredSellersSelected({
  fields,
  remove,
}: {
  fields: FieldArrayWithId[];
  remove: UseFieldArrayRemove;
}) {
  return (
    <div className="flex gap-2 flex-wrap justify-end">
      {fields.map((field, idx) => (
        <div
          key={field.id}
          className="group flex items-center gap-2 bg-background-accent pl-4 pr-2 hover:bg-zinc-700 rounded-full cursor-default"
        >
          <Controller
            name={`ignoredSellers.${idx}`}
            render={({ field }) => (
              <div>
                <span className="pt-0.5 text-sm">{field.value}</span>
                <input {...field} readOnly hidden />
              </div>
            )}
          />
          <button
            type="button"
            onClick={() => remove(idx)}
            className="p-1 text-zinc-500 group-hover:text-foreground cursor-pointer"
          >
            x
          </button>
        </div>
      ))}
    </div>
  );
}

export { IgnoredSellers };
