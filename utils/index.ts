import type { z } from 'zod';
export * from './validators/auth';
export * from './validators/profile';

export function getErrorMessage(error: unknown): string {
  let message: string;

  if (error && typeof error === 'object' && 'statusMessage' in error) {
    message = String(error.statusMessage);
  } else if (error instanceof Error) {
    message = error.message;
  } else if (typeof error === 'string') {
    message = error;
  } else {
    message = 'Something went wrong, please try again later.';
  }

  return message;
}

export function getZodErrorMessage(result: z.SafeParseError<any>): string {
  let errorMessage = '';

  result.error.issues.forEach((issue) => {
    errorMessage = errorMessage + issue.path[0] + ': ' + issue.message + '. ';
  });

  return errorMessage;
}

/**
 * Calculates pagination values based on the given parameters.
 * @param {Object} options - The pagination options.
 * @param {number} options.page - The current page number.
 * @param {number} options.take - The number of rows to display per page.
 * @param {number} options.totalRow - The total number of rows.
 * @returns {Object} - The pagination values.
 */
export function calculatePagination({
  page,
  take,
  totalRow,
}: {
  page: number;
  take: number;
  totalRow: number;
}) {
  const savePage = page < 1 ? 1 : page;
  const rowsPerPage = take;
  const totalPages = Math.ceil(totalRow / rowsPerPage) || 1;
  const isFirstPage = savePage === 1;
  const isLastPage = savePage >= totalPages;
  const previousPage = isFirstPage ? 1 : savePage - 1;
  const nextPage = isLastPage ? totalPages : savePage + 1;

  return {
    currentPage: page,
    isFirstPage,
    isLastPage,
    previousPage,
    nextPage,
    rowsPerPage,
    totalPages,
    totalRow,
    savePage,
  };
}

export const toastSuccess = (message: string) => useToast().add({
  title: 'Success',
  description: message,
  icon: 'i-heroicons-check-circle',
  color: 'green',
  timeout: 10000,
})

export const toastError = (message: string) => useToast().add({
  title: 'Error',
  description: message,
  icon: 'i-heroicons-x-circle',
  color: 'red',
  timeout: 10000,
})