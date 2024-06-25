import { faker } from '@faker-js/faker';
import { z } from 'zod';
import { getZodErrorMessage } from '~/utils';
import type { B2BCompany, City } from '~/types';
import { serverSupabaseClient } from '#supabase/server';
import type { Database } from '~/types/supabase';
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

export default defineEventHandler(async (event) => {
    const zodResult = schema.safeParse(getQuery(event));
    if (!zodResult.success) return { error: getZodErrorMessage(zodResult) };

    const supabase = await serverSupabaseClient<Database>(event);

    if (zodResult.data.clean) {
        console.info('Cleaning up...');

        await supabase.from('Photos').delete().neq('id', 0).throwOnError();
        await supabase.from('B2B_Companies').delete().neq('id', 0).throwOnError();
        await supabase.from('Companies').delete().neq('id', 0).throwOnError();
        await supabase.from('Industries').delete().neq('id', 0).throwOnError();
        await supabase.from('Sizes').delete().neq('id', 0).throwOnError();
        await supabase.from('Cities').delete().neq('id', 0).throwOnError();
        await supabase.from('Provinces').delete().neq('id', 0).throwOnError();
        await supabase.from('Countries').delete().neq('id', 0).throwOnError();
        console.info('Clean up successful');
    }

    console.info('Creating Country...');
    const { data: country, error: countryError } = await supabase
        .from('Countries')
        .insert({ name: 'Indonesia' })
        .select()
        .single();
    if (countryError) {
        console.error('Failed to create country', countryError);
        throw createError({
            status: 500,
            statusMessage: countryError.message,
        });
    }

    console.info('Creating Provinces...');
    console.info('Fetching provinces from API...');
    const provincesRes = await fetch('https://emsifa.github.io/api-wilayah-indonesia/api/provinces.json');
    const provincesData = (await provincesRes.json()) as {
        id: string;
        name: string;
    }[];

    console.info(`Creating ${provincesData.length} provinces...`);
    const provinceRes = await Promise.all(
        provincesData.map(({ id, name }) => supabase.from('Provinces').insert({ id: parseInt(id), name, country_id: country.id }))
    );
    const provinceErrors = provinceRes.filter((res) => res.error);
    if (provinceErrors.length) {
        console.error('Failed to create provinces', provinceErrors);
        throw createError({
            status: 500,
            statusMessage: 'Failed to create provinces',
        });
    }

    console.info('Creating Cities...');
    const citiesData: Pick<City, 'id' | 'name' | 'province_id'>[] = [];
    await Promise.all(
        provincesData.map(async (province) => {
            console.info(`Fetching cities for province ${province.name.toUpperCase()}...`);
            const citiesRes = await fetch(`https://emsifa.github.io/api-wilayah-indonesia/api/regencies/${province.id}.json`);
            const cities = (await citiesRes.json()) as {
                id: string;
                name: string;
            }[];

            console.info(`Creating ${cities.length} cities for province ${province.name.toUpperCase()}...`);
            const cityRes = await Promise.all(
                cities.map(({ id, name }) =>
                    supabase.from('Cities').insert({
                        id: parseInt(id),
                        country_id: country.id,
                        province_id: parseInt(province.id),
                        name,
                    })
                )
            );
            const cityErrors = cityRes.filter((res) => res.error);
            if (cityErrors.length) {
                console.error('Failed to create cities', cityErrors);
                throw createError({
                    status: 500,
                    statusMessage: 'Failed to create cities',
                });
            }

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
    const industriesData = await Promise.all(
        industries.map(async (name) => {
            const res = await supabase.from('Industries').insert({ name }).select().single();
            if (res.error) {
                console.error('Failed to create industry', res.error);
                throw createError({
                    status: 500,
                    statusMessage: res.error.message,
                });
            }

            return res.data;
        })
    );

    console.info('Creating Sizes...');
    const sizesData = await Promise.all(
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
            const sizeRes = await supabase.from('Sizes').insert(size).select().single();
            if (!sizeRes.data) throw new Error('Failed to create size');

            return sizeRes.data;
        })
    );

    console.info('Creating B2B Companies...');
    const B2B_COMPANY_AMOUNT = 100;
    const companiesData: B2BCompany[] = [];
    for (let i = 0; i < B2B_COMPANY_AMOUNT; i++) {
        const name = faker.company.name();
        const phone = faker.phone.number();
        const province = faker.helpers.arrayElement(provincesData);
        const email = faker.internet.email({
            firstName: name,
            lastName: '',
            allowSpecialCharacters: false,
            provider: 'gmail.com',
        });
        const city_id = faker.helpers.arrayElement(citiesData.filter((city) => city.province_id === parseInt(province.id))).id;
        const size_id = faker.helpers.arrayElement(sizesData).id;
        const industry_id = faker.helpers.arrayElement(industriesData).id;

        const companyRes = await supabase
            .from('B2B_Companies')
            .insert({
                name,
                email,
                phone,
                description: faker.lorem.paragraphs(),
                services: faker.lorem.paragraphs(2),
                website: faker.internet.url(),
                linkedin: `https://linkedin.com/company/${name.toLowerCase().replace(/\s/g, '-')}`,
                size_id,
                province_id: parseInt(province.id),
                city_id,
                industry_id,
                street: faker.location.streetAddress(),
                zip_code: faker.location.zipCode(),
                avatar: faker.image.avatarGitHub(),
                created_at: faker.date.past().toISOString(),
                updated_at: faker.date.recent().toISOString(),
            })
            .select()
            .single();
        if (companyRes.error) {
            console.error('Failed to create B2B company', companyRes.error);
            throw createError({
                status: 500,
                statusMessage: companyRes.error.message,
            });
        }

        console.info(`Created B2B company ${i + 1}/${B2B_COMPANY_AMOUNT}`);
        companiesData.push(companyRes.data);
    }

    // console.info('Creating Photos...');
    // const PHOTOS_AMOUNT = 3_000;
    // for (let i = 0; i < PHOTOS_AMOUNT; i++) {
    //     const company = faker.helpers.arrayElement(companiesData);
    //     const photoRes = await supabase
    //         .from('Photos')
    //         .insert({
    //             company_id: company.id,
    //             file: faker.image.urlLoremFlickr({ category: 'business' }),
    //         })
    //         .select()
    //         .single();
    //     if (photoRes.error) {
    //         console.error('Failed to create photo', photoRes.error);
    //         throw createError({
    //             status: 500,
    //             statusMessage: photoRes.error.message,
    //         });
    //     }

    //     console.info(`Created photo ${i + 1}/${PHOTOS_AMOUNT}`);
    // }

    console.info('Creating Companies');
    const COMPANIES_AMOUNT = 100;
    for (let i = 0; i < COMPANIES_AMOUNT; i++) {
        const name = faker.company.name();
        const province = faker.helpers.arrayElement(provincesData);
        const city_id = faker.helpers.arrayElement(citiesData.filter((city) => city.province_id === parseInt(province.id))).id;
        const industry_id = faker.helpers.arrayElement(industriesData).id;

        const companyRes = await supabase
            .from('Companies')
            .insert({
                name,
                phone: faker.phone.number(),
                website: faker.internet.url(),
                linkedin: `https://linkedin.com/company/${name.toLowerCase().replace(/\s/g, '-')}`,
                province_id: parseInt(province.id),
                city_id,
                industry_id,
                street_1: faker.location.streetAddress(),
                postal_code: faker.location.zipCode(),
                created_at: faker.date.past().toISOString(),
                updated_at: faker.date.recent().toISOString(),
            })
            .select()
            .single();
        if (companyRes.error) {
            console.error('Failed to create company', companyRes.error);
            throw createError({
                status: 500,
                statusMessage: companyRes.error.message,
            });
        }

        console.info(`Created company ${i + 1}/${COMPANIES_AMOUNT}`);
    }

    console.info('Seed successful');
    return { success: true };
});
