import { getErrorCode, getNestErrorMessage } from '~/utils';

export default defineEventHandler(async (event) => {
    const fetchApi = await backendApi(event);

    interface IReports {
        [key: string]: {
            total_opportunity: number;
            total_opportunity_won: number;
            call_duration: string;
            call_connected: number;
        };
    }

    try {
        const { data } = await fetchApi<{ data: IReports }>(`/reports/performance-comparison`, {
            query: getQuery(event),
        });

        return Object.keys(data).map((key) => ({
            name: key,
            ...data[key],
        }));
    } catch (error) {
        console.error('Error getting reports performance comparison (SERVER):', error);
        throw createError({ status: getErrorCode(error), statusMessage: getNestErrorMessage(error) });
    }
});
