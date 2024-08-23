import { getErrorCode, getNestErrorMessage } from '~/utils';

export default defineEventHandler(async (event) => {
    const fetchApi = await backendApi(event);

    interface IReports {
        total_opportunity: number | null;
        win_rate: number | null;
        avg_deal_time: number | null;
        avg_deal_size: number | null;
        opportunity_status: {
            [key: string]: {
                count: number;
                est_value: number | null;
                act_value: number;
            };
        };
    }

    try {
        const { data } = await fetchApi<{ data: IReports }>(`/reports/sales-funnel`, {
            query: getQuery(event),
        });

        return data;
    } catch (error) {
        console.error('Error getting reports sales funnel (SERVER):', error);
        throw createError({ status: getErrorCode(error), statusMessage: getNestErrorMessage(error) });
    }
});
