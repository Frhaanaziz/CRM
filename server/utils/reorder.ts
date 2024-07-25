/**
 * Calculates the current element index number based on the previous and next element index numbers.
 * @param prevElIndexNumber The index number of the previous element.
 * @param nextElIndexNumber The index number of the next element.
 * @returns The calculated current element index number.
 * @throws An error if both prevElIndexNumber and nextElIndexNumber are undefined.
 */
export function calculateCurrElIndexNumber(prevElIndexNumber?: number, nextElIndexNumber?: number) {
    let currElIndexNumber: number;

    if (prevElIndexNumber === undefined) {
        if (nextElIndexNumber === undefined)
            throw createError({ status: 400, statusMessage: 'Both prevElIndexNumber and nextElIndexNumber are undefined' });

        currElIndexNumber = nextElIndexNumber + 0.5;
    } else if (nextElIndexNumber === undefined) {
        currElIndexNumber = prevElIndexNumber - 0.5;
    } else {
        currElIndexNumber = (prevElIndexNumber + nextElIndexNumber) / 2;
    }

    return currElIndexNumber;
}
