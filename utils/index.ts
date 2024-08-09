import type { z } from 'zod';
import type { User } from '~/types';
export * from './validators';
export * from './validators/auth';
export * from './validators/user';
export * from './validators/organization';
export * from './validators/company';
export * from './validators/contact';
export * from './validators/lead';
export * from './validators/task';
export * from './validators/opportunity';
export * from './validators/opportunity-status';
export * from './validators/b2b-contact';
export * from './validators/b2b-company';
export * from './validators/activity';
export * from './validators/twilio-setting';
export * from './validators/twilio-agent';
export * from './validators/company-overview';
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

/**
 * Returns the error message from the given error object.
 * If the error object is of type Error, it returns the error message.
 * If the error object has a 'statusMessage' property, it returns the value of that property.
 * If the error object is a string, it returns the error string itself.
 * Otherwise, it returns a default error message.
 *
 * @param error - The error object from which to extract the error message.
 * @returns The error message.
 */
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

// ._data?.errors
export function getNestErrorMessage(error: unknown): string {
    let message: string;

    if (error && typeof error === 'object' && '_data' in error && 'errors' in (error._data as any)) {
        message = (error._data as any).errors;
    } else {
        message = 'Something went wrong, please try again later.';
    }

    return message;
}

/**
 * Retrieves the error code from the given error object.
 * If the error object has a `statusCode` property, it will be used as the error code.
 * Otherwise, a default error code of 500 will be returned.
 *
 * @param error - The error object from which to retrieve the error code.
 * @returns The error code.
 */
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

/**
 * Truncates a string to a specified maximum length and adds a suffix if necessary.
 * If the length of the string is less than or equal to the maximum length, the original string is returned.
 * @param str - The string to truncate.
 * @param maxLength - The maximum length of the truncated string.
 * @param suffix - The suffix to add to the truncated string. If not provided, the default suffix "..." is used.
 * @returns The truncated string.
 */
export function truncateString(str: string, maxLength: number, suffix?: string): string {
    if (str.length <= maxLength) {
        return str; // Jika panjang string kurang dari atau sama dengan maxLength, kembalikan string asli
    }

    // Jika suffix tidak diberikan, gunakan elipsis "..." sebagai default
    const ellipsis = suffix || '...';

    // Potong string hingga panjang maksimum dan tambahkan suffix
    return str.slice(0, maxLength - ellipsis.length) + ellipsis;
}

/**
 * Capitalizes the first letter of a string and converts the rest of the letters to lowercase.
 * @param str - The string to be capitalized.
 * @returns The capitalized string.
 */
export function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Formats a number to Indonesian Rupiah currency format.
 *
 * @param amount - The number to be formatted.
 * @returns The formatted number in Indonesian Rupiah currency format.
 */
export function formatToRupiah(amount: number) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
}

/**
 * Generates a fallback avatar URL based on the provided name.
 * If no name is provided, a default avatar URL is returned.
 * @param name - The name used to generate the avatar URL.
 * @returns The generated fallback avatar URL.
 */
export function getFallbackAvatarUrl(name: string) {
    if (!name) return 'https://ui-avatars.com/api/?name=FA&background=F1F5F9&color=000&bold=true';

    const baseUrl = 'https://ui-avatars.com/api/';
    const params = new URLSearchParams({
        name: name,
        background: 'F1F5F9',
        color: '000',
        bold: 'true',
    });

    return baseUrl + '?' + params.toString();
}

export function getUserFallbackAvatarUrl(user?: Pick<User, 'first_name' | 'last_name'> | { [key: string]: any } | null): string {
    if (!user || !user.first_name || !user.last_name)
        return 'https://ui-avatars.com/api/?name=FA&background=F1F5F9&color=000&bold=true';

    const baseUrl = 'https://ui-avatars.com/api/';
    const params = new URLSearchParams({
        name: getUserFullName(user),
        background: 'F1F5F9',
        color: '000',
        bold: 'true',
    });

    return baseUrl + '?' + params.toString();
}

/**
 * Returns the full name of a user.
 *
 * @param user - The user object containing the first name and last name.
 * @returns The full name of the user.
 */
export function getUserFullName(user?: Pick<User, 'first_name' | 'last_name'> | { [key: string]: any } | null): string {
    if (!user || (!user.first_name && !user.last_name)) return '';
    return (user.first_name ?? '') + ' ' + (user.last_name ?? '');
}

export async function signOutUser() {
    const supabase = useSupabaseClient();
    const { error } = await supabase.auth.signOut();
    if (error) {
        console.error('Sign out error:', error);
        toast.error('Failed to sign out, please try again.');
    }
    const sessionStore = userSessionStore();
    sessionStore.session = null;
    sessionStore.user = null;
    await navigateTo('/auth/signin');
}
