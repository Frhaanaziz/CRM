import type { Company, Inbox, CallLog, Task, Lead } from '~/types';
import { getErrorCode, getNestErrorMessage } from '~/utils';

export default defineEventHandler(async (event) => {
    interface IInbox extends Inbox {
        call_log?: CallLog | null;
        tasks?: (Task & { lead?: (Lead & { company?: Company | null }) | null }) | null;
    }

    try {
        const fetchApi = await backendApi(event);
        const { data } = await fetchApi<{ data: IInbox[] }>('/inboxes');

        return data.map(({ tasks, ...rest }) => ({ ...rest, task: tasks }));
    } catch (error) {
        console.error('Error getting inboxes (SERVER):', error);
        throw createError({ status: getErrorCode(error), statusMessage: getNestErrorMessage(error) });
    }
});
