import path from 'node:path';
import type { NextConfig } from 'next';

const config: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.discordapp.com',
        pathname: '/{icons,avatars}/**',
      },
    ],
  },
  transpilePackages: ['@dealbot/api', '@dealbot/db'],
  turbopack: {
    root: path.join(__dirname, '../..'),
  },
};

export default config;
