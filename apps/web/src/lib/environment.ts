const isProduction = process.env.NODE_ENV === 'production';
const isVercel = process.env.VERCEL === '1';

const VERCEL_BASE_URL = isProduction
  ? 'https://' + process.env.VERCEL_PROJECT_PRODUCTION_URL
  : 'https://' + process.env.VERCEL_URL;
const BASE_URL = isVercel ? VERCEL_BASE_URL : process.env.NEXT_PUBLIC_BASE_URL;

export { BASE_URL };
