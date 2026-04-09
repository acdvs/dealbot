'use client';

import { countries } from '@dealbot/db/values';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
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

  const { data: settings } = useQuery({
    queryKey: ['guild-settings', guildId],
    queryFn: async () => getGuildSettings(guildId),
  });

  const form = useForm<Schema>({
    resolver: zodResolver(schema),
    defaultValues: settings,
  });
  const { formState } = form;
  const { submitCount } = formState;

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
