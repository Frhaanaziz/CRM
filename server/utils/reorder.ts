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
