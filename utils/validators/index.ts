import { z } from 'zod';

const FILE_SIZE_5MB = 1024 * 1024 * 5;
/**
 * Validates a file object.
 * @param file - The file object to validate.
 * @returns A validation schema for the file object.
 */
export const photoSchema = z
    .instanceof(File, { message: 'Please upload a file' })
    .refine((file) => file.size < FILE_SIZE_5MB, {
        message: 'File size must be less than 5MB',
    })
    .refine((file) => ['image/jpeg', 'image/png'].includes(file.type), {
        message: 'File must be a JPEG, JPG or PNG image',
    });
