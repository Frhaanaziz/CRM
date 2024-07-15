import type { City, Company, Contact, Industry, Province, Size } from '~/types';

export default defineEventHandler(async (event) => {
    interface ICompany extends Company {
        primaryContact: Contact | null;
        industry: Pick<Industry, 'name'> | null;
        size: Pick<Size, 'size_range'> | null;
        province: Pick<Province, 'name'> | null;
        city: Pick<City, 'name'> | null;
    }

    const fetchApi = await backendApi(event);
    const { data } = await fetchApi<{ data: ICompany[] }>('/companies');

    return data;
});
