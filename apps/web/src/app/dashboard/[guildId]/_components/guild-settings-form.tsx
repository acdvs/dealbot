'use client';

import { Controller, FormProvider } from 'react-hook-form';
import { Field } from '@base-ui-components/react/field';
import { Form } from '@base-ui-components/react/form';
import { RiCheckLine } from '@remixicon/react';

import IgnoredSellers from './ignored-sellers';
import useFormState, { schema, Schema } from '../_hooks/use-form-state';
import { saveGuildSettings } from '@/actions/guild';
import LoadingDots from '@/components/loading-dots';
import LoadingState from '@/components/state/loading';
import Button from '@/components/ui/button';
import Select from '@/components/ui/select';
import { countries } from '@dealbot/db/values';

const countryOptions = countries
  .sort((a, b) => (a.name < b.name ? -1 : 1))
  .map((x) => ({ label: x.name, value: x.code }));

function GuildSettingsForm({ guildId }: { guildId: string }) {
  const { sellers, defaultValues, formState, methods, successVisible } =
    useFormState(guildId);
  const { control, handleSubmit, register, reset } = methods;
  const { isDirty, isLoading, isSubmitting } = formState;

  const submit = async (data: Schema) => {
    const parsed = schema.safeParse(data);

    if (parsed.success) {
      await saveGuildSettings(parsed.data);
      reset(data, { keepSubmitCount: true });
    }
  };

  if (isLoading || !sellers || !defaultValues) {
    return <LoadingState label="Loading server settings" className="h-40" />;
  }

  return (
    <FormProvider {...methods}>
      <Form onSubmit={handleSubmit(submit)} className="flex flex-col gap-6">
        <input {...register('guildId')} required hidden readOnly />
        <Field.Root>
          <Field.Label className="leading-none">Country</Field.Label>
          <Field.Description className="text-foreground-accent leading-none mb-2">
            Filters results by location
          </Field.Description>
          <Controller
            name="countryCode"
            control={control}
            render={({ field }) => (
              <Select
                items={countryOptions}
                value={field.value}
                onValueChange={field.onChange}
                required
              />
            )}
          />
        </Field.Root>
        <Field.Root>
          <Field.Label className="leading-none">Ignored sellers</Field.Label>
          <Field.Description className="text-foreground-accent leading-none mb-2">
            Hides sellers from all results
          </Field.Description>
          <IgnoredSellers items={sellers} />
        </Field.Root>
        <div className="flex items-center gap-5">
          <Button
            type="submit"
            disabled={isLoading || !isDirty || isSubmitting}
            className="self-start"
          >
            {isSubmitting ? <LoadingDots className="p-2" /> : 'Save'}
          </Button>
          {successVisible && (
            <div className="flex items-center gap-1">
              <p className="text-sm text-success">Saved</p>
              <RiCheckLine className="size-5 fill-success" />
            </div>
          )}
        </div>
      </Form>
    </FormProvider>
  );
}

export default GuildSettingsForm;
