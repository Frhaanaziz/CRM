import type { z } from 'zod';
export * from './validators/auth';
export * from './validators/profile';

export function getZodErrorMessage(result: z.SafeParseError<any>): string {
  let errorMessage = '';

  result.error.issues.forEach((issue) => {
    errorMessage = errorMessage + issue.path[0] + ': ' + issue.message + '. ';
  });

  return errorMessage;
}

export function extractDomain(url: string): string {
  // Menggunakan regex untuk mengekstrak domain
  // const domainRegex = /^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n]+)/;
  const domainRegex = /^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:/\n]+)/;
  const match = url.match(domainRegex);

  if (match && match[1]) {
    return match[1];
  } else {
    return '';
  }
}

export const toast = {
  success(message: string): void {
    useToast().add({
      title: 'Success',
      description: message,
      icon: 'i-heroicons-check-circle',
      color: 'green',
      timeout: 10000,
    });
  },

  error(message: string): void {
    useToast().add({
      title: 'Error',
      description: message,
      icon: 'i-heroicons-x-circle',
      color: 'red',
      timeout: 10000,
    });
  },
};