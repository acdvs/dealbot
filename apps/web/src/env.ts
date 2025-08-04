import path from 'node:path';
import { loadEnvConfig } from '@next/env';

// cwd = project root
loadEnvConfig(path.join(process.cwd(), '../..'));
