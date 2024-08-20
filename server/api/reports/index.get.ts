import { getErrorCode, getNestErrorMessage } from '~/utils';

export default defineEventHandler(async (event) => {
    const fetchApi = await backendApi(event);

    interface IReports {
        total_opportunity: number;
        avg_deal_age: number | null;
        avg_deal_size: number | null;
        opportunity_status: {
            [key: string]: {
                count: number;
                est_value?: number | null;
                act_value: number;
            };
        };
        opportunity_leaderboard: {
            name: string;
            opportunity_created: number;
            total: number;
            opportunity_won: number;
        }[];
        leads_industry: {
            [key: string]: number;
        };
        leads_size: {
            [key: string]: number;
        };
    }

    try {
        const { data } = await fetchApi<{ data: IReports }>(`/reports`, {
            query: getQuery(event),
        });

        return data;
    } catch (error) {
        console.error('Error getting reports (SERVER):', error);
        throw createError({ status: getErrorCode(error), statusMessage: getNestErrorMessage(error) });
    }
});
