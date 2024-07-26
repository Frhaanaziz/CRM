export default defineEventHandler(async (event) => {
    const fetchApi = await backendApi(event);

    interface IReports {
        data: {
            opportunity_data: {
                total_act_revenue: number;
                total_opportunity_won: number;
                total_new_opportunities: number;
                percentage_opportunity_won: number;
                percentage_new_opportunities: number;
                total_sales: { date: string; total: number }[];
                opportunity_leaderboard: { name: string; total: number }[];
                opportunity_lost_reason: Record<string, number>;
            };
            lead_data: {
                total_new_leads: number;
                percentage_new_leads: number;
                leads_rating: Record<string, number>;
                leads_industry: Record<string, number>;
                leads_size: Record<string, number>;
            };
        };
    }

    const { data } = await fetchApi<IReports>(`/reports`, {
        query: getQuery(event),
    });
    return data;
});
