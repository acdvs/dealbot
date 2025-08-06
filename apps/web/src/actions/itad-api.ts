'use server';

import { api } from '@/lib/itad-api';

export async function getSellers() {
  return await api.getSellers();
}
