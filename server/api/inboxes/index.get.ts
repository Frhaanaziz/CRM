import type { Company, Inbox, CallLog, Task, Lead, PaginationUtils } from '~/types';
import { getErrorCode, getNestErrorMessage } from '~/utils';
import qs from 'qs';

export default defineEventHandler(async (event) => {
    interface IInbox extends Inbox {
        call_log?: CallLog | null;
        tasks?: (Task & { lead?: (Lead & { company?: Company | null }) | null }) | null;
    }

    const query = getQuery(event);

    try {
        const fetchApi = await backendApi(event);
        const { data } = await fetchApi<{ data: PaginationUtils & { result: IInbox[] } }>(
            `/inboxes?${qs.stringify({
                ...query,
                filters: {
                    is_read: query.is_read,
                    type: query.type,
                },
            })}`
        );

        return { ...data, result: data.result.map(({ tasks, ...inbox }) => ({ ...inbox, task: tasks })) };
    } catch (error) {
        console.error('Error getting inboxes (SERVER):', error);
        throw createError({ status: getErrorCode(error), statusMessage: getNestErrorMessage(error) });
    }
});
