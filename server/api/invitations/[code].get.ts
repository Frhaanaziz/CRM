import type { Invitation, Organization, User } from '~/types';
import { getErrorCode, getNestErrorMessage } from '~/utils';

export default defineEventHandler(async (event) => {
    const code = getRouterParam(event, 'code');
    if (!code) throw createError({ status: 400, statusMessage: 'No id provided' });

    interface IInvitation extends Invitation {
        user?: User | null;
        org?: Organization | null;
    }

    try {
        const fetchApi = await backendApi(event);
        const { data } = await fetchApi<{ data: IInvitation }>(`/invitations/${code}`);

        return data;
    } catch (error) {
        console.error(`Error getting invitation with code ${code} (SERVER):`, error);
        throw createError({ status: getErrorCode(error), statusMessage: getNestErrorMessage(error) });
    }
});
