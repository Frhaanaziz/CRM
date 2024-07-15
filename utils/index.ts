import type { z } from 'zod';
import type { User } from '~/types';
export * from './validators/auth';
export * from './validators/user';
export * from './validators/organization';
export * from './validators/company';
export * from './validators/contact';
export * from './validators/lead';
export * from './validators/task';
export * from './validators/opportunity';
export * from './validators/b2b-contact';
export * from './validators/b2b-company';
export * from './validators/activity';
export * from './constants';

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
            title: 'Failed',
            description: message,
            icon: 'i-heroicons-x-circle',
            color: 'red',
            timeout: 10000,
        });
    },
};

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

export function getErrorCode(error: unknown): number {
    let code: number;

    if (error && typeof error === 'object' && 'statusCode' in error) {
        code = Number(error.statusCode);
    } else {
        code = 500;
    }

    return code;
}

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

export function truncateString(str: string, maxLength: number, suffix?: string): string {
    if (str.length <= maxLength) {
        return str; // Jika panjang string kurang dari atau sama dengan maxLength, kembalikan string asli
    }

    // Jika suffix tidak diberikan, gunakan elipsis "..." sebagai default
    const ellipsis = suffix || '...';

    // Potong string hingga panjang maksimum dan tambahkan suffix
    return str.slice(0, maxLength - ellipsis.length) + ellipsis;
}

export function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function formatToRupiah(amount: number) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
}

export function getFallbackAvatarUrl(name: string) {
    if (!name) return 'https://ui-avatars.com/api/?name=FA&background=3892F3&color=fff&bold=true';

    const baseUrl = 'https://ui-avatars.com/api/';
    const params = new URLSearchParams({
        name: name,
        background: '3892F3',
        color: 'fff',
        bold: 'true',
    });

    return baseUrl + '?' + params.toString();
}

export function getUserFallbackAvatarUrl(user?: Pick<User, 'first_name' | 'last_name'> | { [key: string]: any } | null): string {
    if (!user || !user.first_name || !user.last_name)
        return 'https://ui-avatars.com/api/?name=FA&background=3892F3&color=fff&bold=true';

    const name = user.first_name + ' ' + user.last_name;
    const baseUrl = 'https://ui-avatars.com/api/';
    const params = new URLSearchParams({
        name: name,
        background: '3892F3',
        color: 'fff',
        bold: 'true',
    });

    return baseUrl + '?' + params.toString();
}

export function getUserFullName(user?: Pick<User, 'first_name' | 'last_name'> | null): string {
    if (!user || !user.first_name || !user.last_name) return '---';
    return user.first_name + ' ' + user.last_name;
}
