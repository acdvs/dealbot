'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { getGuildSettings } from '@/actions/guild';
import { getSellers } from '@dealbot/api/requests';
import { countries } from '@dealbot/db/values';
import { countries, DEFAULT_COUNTRY_CODE } from '@dealbot/db/values';

const countryCodes = countries.map((x) => x.code);

export const schema = z.object({
  guildId: z.string().readonly(),
  countryCode: z.enum(countryCodes),
  ignoredSellers: z.string().array(),
});

export type Schema = z.infer<typeof schema>;
type GuildSettings = Awaited<ReturnType<typeof getGuildSettings>>;

function useFormState(guildId: string) {
  const [sellers, setSellers] = useState<string[] | null>(null);
  const [guildSettings, setGuildSettings] = useState<GuildSettings | null>(
    null
  );
  const [successVisible, setSuccessVisible] = useState(false);

  const methods = useForm<Schema>({
    resolver: zodResolver(schema),
    defaultValues: {
      guildId,
      countryCode: DEFAULT_COUNTRY_CODE,
      ignoredSellers: [],
    },
  });
  const { formState, setValue } = methods;
  const { submitCount } = formState;

  useEffect(() => {
    if (!sellers && !guildSettings) {
      (async function getFormData() {
        const _sellers = await getSellers();
        const _guildSettings = await getGuildSettings(guildId);
        console.log({ _guildSettings });
        setSellers(_sellers.map((x) => x.title));
        setGuildSettings(_guildSettings);

        setValue('countryCode', _guildSettings?.countryCode);
        setValue('ignoredSellers', _guildSettings?.ignoredSellers);
      })();
    }
  }, []);

  useEffect(() => {
    if (submitCount > 0) {
      setSuccessVisible(true);
      const timeout = setTimeout(() => setSuccessVisible(false), 5000);
      return () => clearTimeout(timeout);
    }
  }, [submitCount]);

  return {
    sellers,
    defaultValues: guildSettings,
    formState,
    methods,
    successVisible,
  };
}

export default useFormState;
