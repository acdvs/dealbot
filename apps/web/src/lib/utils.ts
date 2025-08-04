import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cx(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function userIsGuildAdmin(permissions: string) {
  return Number(permissions) & (1 << 3);
}
