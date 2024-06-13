import type { z } from 'zod';
export * from './validators/auth';
export * from './validators/profile';

/**
 * Returns the error message from a Zod parse result.
 * @param result - The Zod parse result.
 * @returns The error message.
 */
export function getZodErrorMessage(result: z.SafeParseError<any>): string {
    let errorMessage = '';

    result.error.issues.forEach((issue) => {
        errorMessage = errorMessage + issue.path[0] + ': ' + issue.message + '. ';
    });

    return errorMessage;
}

/**
 * Extracts the domain from a given URL.
 * @param url - The URL from which to extract the domain.
 * @returns The extracted domain.
 */
export function extractDomain(url: string): string {
    const domainRegex = /^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:/\n]+)/;
    const match = url.match(domainRegex);

    if (match && match[1]) {
        return match[1];
    } else {
        return '';
    }
}

/**
 * A utility object for displaying toast messages.
 */
export const toast = {
    /**
     * Displays a success toast message.
     * @param message - The message to be displayed.
     */
    success(message: string): void {
        useToast().add({
            title: 'Success',
            description: message,
            icon: 'i-heroicons-check-circle',
            color: 'green',
            timeout: 10000,
        });
    },

    /**
     * Displays an error toast message.
     * @param message - The message to be displayed.
     */
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
