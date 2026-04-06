import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cx(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function userIsGuildAdmin(permissions: string) {
  return Boolean(BigInt(permissions) & BigInt(1 << 3));
}
