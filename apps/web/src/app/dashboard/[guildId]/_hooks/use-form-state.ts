'use client';

import { countries, DEFAULT_COUNTRY_CODE } from '@dealbot/db/values';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { getGuildSettings } from '@/actions/guild';

const countryCodes = countries.map((x) => x.code);

export const schema = z.object({
  guildId: z.string().readonly(),
  countryCode: z.enum(countryCodes),
  ignoredSellers: z.string().array(),
});

export type Schema = z.infer<typeof schema>;

function useFormState(guildId: string) {
  const [successVisible, setSuccessVisible] = useState(false);

  const form = useForm<Schema>({
    resolver: zodResolver(schema),
    defaultValues: {
      guildId,
      countryCode: DEFAULT_COUNTRY_CODE,
      ignoredSellers: [],
    },
  });
  const { formState } = form;
  const { submitCount } = formState;

  useEffect(() => {
    getGuildSettings(guildId).then((x) => {
      form.setValue('countryCode', x.countryCode);
      form.setValue('ignoredSellers', x.ignoredSellers);
    });
  }, [guildId, form.setValue]);

  useEffect(() => {
    if (submitCount > 0) {
      setSuccessVisible(true);
      const timeout = setTimeout(() => setSuccessVisible(false), 5000);
      return () => clearTimeout(timeout);
    }
  }, [submitCount]);

  return {
    formState,
    form,
    successVisible,
  };
}

export default useFormState;
