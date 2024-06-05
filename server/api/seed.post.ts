import { H3Event } from 'h3';
import { faker } from '@faker-js/faker';
import { z } from 'zod';
import { getZodErrorMessage } from '~/utils';
import type { City, Industry, Size } from '~/types';

const schema = z.object({
    clean: z.coerce.boolean().optional(),
});

const industries = [
    'Technology',
    'Finance',
    'Health',
    'Education',
    'Transportation',
    'Construction',
    'Manufacturing',
    'Retail',
    'Hospitality',
    'Entertainment',
    'Agriculture',
    'Energy',
    'Telecommunication',
    'Media',
    'Real Estate',
    'Government',
    'Nonprofit',
];

export default defineEventHandler(async (event: H3Event) => {
    const zodResult = schema.safeParse(getQuery(event));
    if (!zodResult.success) return { error: getZodErrorMessage(zodResult) };

    const supabase = event.context.supabase;

    if (zodResult.data.clean) {
        console.info('Cleaning up...');
        await Promise.all([
            await supabase.from('Provinces').delete().match({}),
            await supabase.from('Cities').delete().match({}),
            await supabase.from('Industries').delete().match({}),
            await supabase.from('Sizes').delete().match({}),
            await supabase.from('Photos').delete().match({}),
            await supabase.from('Companies').delete().match({}),
        ]);
    }

    console.info('Creating Provinces...');
    console.info('Fetching provinces from API...');
    const provincesRes = await fetch(
        'https://emsifa.github.io/api-wilayah-indonesia/api/provinces.json'
    );
    const provincesData = (await provincesRes.json()) as {
        id: string;
        name: string;
    }[];

    console.info(`Creating ${provincesData.length} provinces...`);
    await Promise.all(
        provincesData.map(({ id, name }) =>
            supabase.from('Provinces').insert({ id: parseInt(id), name })
        )
    );

    console.info('Creating Cities...');
    const citiesData: Pick<City, 'id' | 'name' | 'province_id'>[] = [];
    await Promise.all(
        provincesData.map(async (province) => {
            console.info(
                `Fetching cities for province ${province.name.toUpperCase()}...`
            );
            const citiesRes = await fetch(
                `https://emsifa.github.io/api-wilayah-indonesia/api/regencies/${province.id}.json`
            );
            const cities = (await citiesRes.json()) as {
                id: string;
                name: string;
            }[];

            console.info(
                `Creating ${
                    cities.length
                } cities for province ${province.name.toUpperCase()}...`
            );
            await Promise.all(
                cities.map(({ id, name }) =>
                    supabase.from('Cities').insert({
                        id: parseInt(id),
                        province_id: parseInt(province.id),
                        name,
                    })
                )
            );

            citiesData.push(
                ...cities.map(({ id, name }) => ({
                    id: parseInt(id),
                    name,
                    province_id: parseInt(province.id),
                }))
            );
        })
    );

    console.info('Creating Industries...');
    console.info(`Creating ${industries.length} industries...`);
    const industriesData: Industry[] = [];
    await Promise.all(
        industries.map(async (name) => {
            const res = await supabase
                .from('Industries')
                .insert({ name })
                .select()
                .single();
            if (res.error) {
                console.error('Failed to create industry', res.error);
                throw new Error('Failed to create industry');
            }

            industriesData.push(res.data);
        })
    );

    console.info('Creating Sizes...');
    const sizesData: Size[] = [];
    await Promise.all(
        [
            { size_range: '1-10' },
            { size_range: '11-50' },
            { size_range: '51-200' },
            { size_range: '201-500' },
            { size_range: '501-1000' },
            { size_range: '1001-5000' },
            { size_range: '5001-10000' },
            { size_range: '10001+' },
        ].map(async (size) => {
            const sizeRes = await supabase
                .from('Sizes')
                .insert(size)
                .select()
                .single();
            if (!sizeRes.data) throw new Error('Failed to create size');
            sizesData.push(sizeRes.data);
        })
    );

    console.info('Creating Companies...');
    const COMPANY_AMOUNT = 100;
    for (let i = 0; i < COMPANY_AMOUNT; i++) {
        const name = faker.company.name();
        const phone = faker.phone.number();
        const province = faker.helpers.arrayElement(provincesData);
        const email = faker.internet.email({
            firstName: name,
            lastName: '',
            allowSpecialCharacters: false,
            provider: 'gmail.com',
        });
        const city_id = faker.helpers.arrayElement(
            citiesData.filter(
                (city) => city.province_id === parseInt(province.id)
            )
        ).id;
        const size_id = faker.helpers.arrayElement(sizesData).id;
        const industry_id = faker.helpers.arrayElement(industriesData).id;

        const companyRes = await supabase.from('Companies').insert({
            name,
            phone,
            province_id: parseInt(province.id),
            city_id,
            description: faker.company.catchPhrase(),
            email,
            industry_id,
            services: faker.company.buzzPhrase(),
            size_id,
            created_at: faker.date.past().toISOString(),
            updated_at: faker.date.recent().toISOString(),
        });
        if (companyRes.error) {
            console.error('Failed to create company', companyRes.error);
            throw createError({
                status: 500,
                statusMessage: companyRes.error.message,
            });
        }

        console.info(`Created company ${i + 1}/${COMPANY_AMOUNT}`);
    }
});
