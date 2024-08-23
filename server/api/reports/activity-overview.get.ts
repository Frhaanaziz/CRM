import { getErrorCode, getNestErrorMessage } from '~/utils';

export default defineEventHandler(async (event) => {
    const fetchApi = await backendApi(event);

    interface IReports {
        total_opportunity: number | null;
        win_rate: number | null;
        avg_deal_time: number | null;
        avg_deal_size: number | null;
        opportunity_leaderboard: {
            name: string;
            value: number;
        }[];
        leads_industry: {
            [key: string]: number;
        };
        leads_size: {
            [key: string]: number;
        };
    }

    try {
        const { data } = await fetchApi<{ data: IReports }>(`/reports/activity-overview`, {
            query: getQuery(event),
        });

        return data;
    } catch (error) {
        console.error('Error getting reports activity overview (SERVER):', error);
        throw createError({ status: getErrorCode(error), statusMessage: getNestErrorMessage(error) });
    }
});
