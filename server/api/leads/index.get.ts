import type { Company, Contact, DisqualifyReason, Lead, LeadStatus, User, Source, Rating } from '~/types';

export default defineEventHandler(async (event) => {
    interface ILead extends Lead {
        contact: Pick<Contact, 'first_name' | 'last_name'> | null;
        company: Pick<Company, 'name'> | null;
        rating: Pick<Rating, 'name'> | null;
        status: Pick<LeadStatus, 'name'> | null;
        disqualify_reason: Pick<DisqualifyReason, 'name'> | null;
        source: Pick<Source, 'name'> | null;
        user: Pick<User, 'first_name' | 'last_name'> | null;
    }

    const fetchApi = await backendApi(event);
    const { data } = await fetchApi<{ data: ILead[] }>('/leads');

    return data;
});
