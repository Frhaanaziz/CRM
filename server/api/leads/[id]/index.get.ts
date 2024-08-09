import type {
    City,
    Company,
    CompanyOverview,
    Contact,
    Country,
    Industry,
    Lead,
    Opportunity,
    OpportunityStatus,
    Province,
    Rating,
    Size,
    Task,
    User,
} from '~/types';
import { getErrorCode, getNestErrorMessage } from '~/utils';

export default defineEventHandler(async (event) => {
    const id = event.context.params!.id;

    interface ILead extends Lead {
        company:
            | (Company & {
                  industry?: Pick<Industry, 'id' | 'name'> | null;
                  size?: Pick<Size, 'id' | 'size_range'> | null;
                  country?: Pick<Country, 'id' | 'name'> | null;
                  province?: Pick<Province, 'id' | 'name'> | null;
                  city?: Pick<City, 'id' | 'name'> | null;
                  contacts?: Contact[] | null;
                  overviews?: CompanyOverview[] | null;
              })
            | null;
        rating?: Rating | null;
        user?: User | null;
        tasks?: (Task & { user?: User | null })[] | null;
        opportunities?: (Opportunity & { contact?: Contact | null; status?: OpportunityStatus | null })[] | null;
    }

    try {
        const fetchApi = await backendApi(event);
        const { data } = await fetchApi<{ data: ILead }>(`/leads/${id}`);

        return data;
    } catch (error) {
        console.error('Error getting lead (SERVER):', error);
        throw createError({ status: getErrorCode(error), statusMessage: getNestErrorMessage(error) });
    }
});
