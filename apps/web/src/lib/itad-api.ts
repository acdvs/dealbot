import APIClient from '@dealbot/api/client';

export const api = new APIClient(process.env.ITAD_API_KEY!);
