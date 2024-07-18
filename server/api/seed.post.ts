import { faker } from '@faker-js/faker';
import { z } from 'zod';
import { getZodErrorMessage } from '~/utils';
import type { City } from '~/types';
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
    'Others',
];
const SIZE_RANGE = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1001-5000', '5001-10000', '10001+'];
const ORGANIZATION_ID: number = 2;
const USER_ID: string = 'a11f8160-b300-4e8b-be0d-42089b170423';
const B2B_COMPANY_AMOUNT = 50;
const COMPANIES_AMOUNT = 50;
const CONTACTS_AMOUNT = 100;
const OPPORTUNITIES_AMOUNT = 50;
const CONTACT_STATUSES = ['new', 'qualified', 'disqualified'] as const;
const LEAD_STATUSES = ['new', 'contacted', 'qualified', 'disqualified'] as const;
const COMPANY_STATUSES = ['new', 'qualified', 'disqualified'] as const;
const RATINGS = ['cool', 'warm', 'hot'] as const;
const SOURCES = ['manual', 'linkedin', 'google'] as const;
const DISQUALIFY_REASONS = ['lost', 'cannot contact', 'no longer interested', 'canceled'] as const;
const CLOSE_REASONS = ['pricing', 'competition', 'long sales cycle', 'communication', 'decision making', 'others'] as const;
const OPPORTUNITY_STATUSES = ['qualified', 'proposal send', 'contract send', 'won', 'lost'] as const;
const PAYMENT_PLANS = ['one-time', 'weekly', 'monthly', 'yearly'] as const;

export default defineEventHandler(async (event) => {
    const zodResult = schema.safeParse(getQuery(event));
    if (!zodResult.success) return { error: getZodErrorMessage(zodResult) };

    const supabase = await serverSupabaseClient<Database>(event);

    if (zodResult.data.clean) {
        console.info('Cleaning up...');

        await supabase.from('Photos').delete().neq('id', 0).throwOnError();
        await supabase.from('B2B_Companies').delete().neq('id', 0).throwOnError();
        await supabase.from('Opportunities').delete().neq('id', 0).throwOnError();
        await supabase.from('Opportunity_Statuses').delete().neq('id', 0).throwOnError();
        await supabase.from('Close_Reasons').delete().neq('id', 0).throwOnError();
        await supabase.from('Payment_Plans').delete().neq('id', 0).throwOnError();
        await supabase.from('Companies').delete().neq('id', 0).throwOnError();
        await supabase.from('Company_Statuses').delete().neq('id', 0).throwOnError();
        await supabase.from('Industries').delete().neq('id', 0).throwOnError();
        await supabase.from('Contacts').delete().neq('id', 0).throwOnError();
        await supabase.from('Contact_Statuses').delete().neq('id', 0).throwOnError();
        await supabase.from('Leads').delete().neq('id', 0).throwOnError();
        await supabase.from('Sources').delete().neq('id', 0).throwOnError();
        await supabase.from('Disqualify_Reasons').delete().neq('id', 0).throwOnError();
        await supabase.from('Ratings').delete().neq('id', 0).throwOnError();
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
    const provincesAPIRes = await fetch('https://emsifa.github.io/api-wilayah-indonesia/api/provinces.json');
    const provincesAPIData = (await provincesAPIRes.json()) as {
        id: string;
        name: string;
    }[];

    console.info(`Creating ${provincesAPIData.length} provinces...`);
    const { data: provincesData, error: provincesDataError } = await supabase
        .from('Provinces')
        .insert(provincesAPIData.map(({ id, name }) => ({ id: parseInt(id), name, country_id: country.id })))
        .select('*');
    if (provincesDataError) {
        console.error('Failed to create provinces', provincesDataError);
        throw createError({
            status: 500,
            statusMessage: provincesDataError.message,
        });
    }

    console.info('Creating Cities...');
    const citiesData: City[] = [];
    await Promise.all(
        provincesData.map(async (province) => {
            console.info(`Fetching cities for province ${province.name.toUpperCase()}...`);
            const citiesRes = await fetch(`https://emsifa.github.io/api-wilayah-indonesia/api/regencies/${province.id}.json`);
            const cities = (await citiesRes.json()) as {
                id: string;
                name: string;
            }[];

            console.info(`Creating ${cities.length} cities for province ${province.name.toUpperCase()}...`);
            const { data: citiesDBData, error: citiesError } = await supabase
                .from('Cities')
                .insert(
                    cities.map(({ id, name }) => ({
                        id: parseInt(id),
                        country_id: country.id,
                        province_id: province.id,
                        name,
                    }))
                )
                .select('*');
            if (citiesError) {
                console.error('Failed to create cities', citiesError);
                throw createError({
                    status: 500,
                    statusMessage: citiesError.message,
                });
            }

            citiesData.push(...citiesDBData);
        })
    );

    console.info(`Creating ${industries.length} industries...`);
    const { data: industriesData, error: industriesError } = await supabase
        .from('Industries')
        .insert(industries.map((name) => ({ name })))
        .select('*');
    if (industriesError) {
        console.error('Failed to create industries', industriesError);
        throw createError({
            status: 500,
            statusMessage: industriesError.message,
        });
    }

    console.info(`Creating ${SIZE_RANGE.length} sizes...`);
    const { data: sizesData, error: sizesError } = await supabase
        .from('Sizes')
        .insert(SIZE_RANGE.map((size_range) => ({ size_range })))
        .select();
    if (sizesError) {
        console.error('Failed to create sizes', sizesError);
        throw createError({
            status: 500,
            statusMessage: sizesError.message,
        });
    }

    // console.info(`Creating ${B2B_COMPANY_AMOUNT} B2B companies...`);
    // const { error: B2BCompaniesError } = await supabase.from('B2B_Companies').insert(
    //     Array.from({ length: B2B_COMPANY_AMOUNT }, () => {
    //         const name = faker.company.name();
    //         const phone = faker.phone.number();
    //         const province = faker.helpers.arrayElement(provincesData);
    //         const email = faker.internet.email({
    //             firstName: name,
    //             lastName: '',
    //             allowSpecialCharacters: false,
    //             provider: 'gmail.com',
    //         });
    //         const city_id = faker.helpers.arrayElement(citiesData.filter((city) => city.province_id === province.id)).id;
    //         const size_id = faker.helpers.arrayElement(sizesData).id;
    //         const industry_id = faker.helpers.arrayElement(industriesData).id;

    //         return {
    //             name,
    //             email,
    //             phone,
    //             description: faker.lorem.paragraphs(),
    //             services: faker.lorem.paragraphs(2),
    //             website: faker.internet.url(),
    //             linkedin: `https://linkedin.com/company/${name.toLowerCase().replace(/\s/g, '-')}`,
    //             size_id,
    //             province_id: province.id,
    //             city_id,
    //             industry_id,
    //             street: faker.location.streetAddress(),
    //             zip_code: faker.location.zipCode(),
    //             avatar: faker.image.avatarGitHub(),
    //             created_at: faker.date.past().toISOString(),
    //             updated_at: faker.date.recent().toISOString(),
    //         };
    //     })
    // );
    // // .select('*');
    // if (B2BCompaniesError) {
    //     console.error('Failed to create B2B companies', B2BCompaniesError);
    //     throw createError({
    //         status: 500,
    //         statusMessage: B2BCompaniesError.message,
    //     });
    // }

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

    console.info(`Creating ${COMPANY_STATUSES.length} company statuses...`);
    const { data: companyStatusesData, error: companyStatusesError } = await supabase
        .from('Company_Statuses')
        .insert(COMPANY_STATUSES.map((name) => ({ name })))
        .select();
    if (companyStatusesError) {
        console.error('Failed to create company status', companyStatusesError);
        throw createError({
            status: 500,
            statusMessage: companyStatusesError.message,
        });
    }

    console.info(`Creating ${COMPANIES_AMOUNT} companies...`);
    const { data: companiesData, error: companiesError } = await supabase
        .from('Companies')
        .insert(
            Array.from({ length: COMPANIES_AMOUNT }, () => {
                const name = faker.company.name();
                const province_id = faker.helpers.arrayElement(provincesData).id;
                const city_id = faker.helpers.arrayElement(citiesData.filter((city) => city.province_id === province_id)).id;
                const industry_id = faker.helpers.arrayElement(industriesData).id;
                const company_status_id = faker.helpers.arrayElement(companyStatusesData).id;

                return {
                    name,
                    phone: faker.phone.number(),
                    website: faker.internet.url(),
                    linkedin: `https://linkedin.com/company/${name.toLowerCase().replace(/\s/g, '-')}`,
                    country_id: country.id,
                    province_id,
                    city_id,
                    industry_id,
                    size_id: faker.helpers.arrayElement(sizesData).id,
                    street_1: faker.location.streetAddress(),
                    postal_code: faker.location.zipCode(),
                    created_at: faker.date.past().toISOString(),
                    updated_at: faker.date.recent().toISOString(),
                    organization_id: ORGANIZATION_ID,
                    company_status_id,
                    user_id: USER_ID,
                };
            })
        )
        .select('*');
    if (companiesError) {
        console.error('Failed to create companies', companiesError);
        throw createError({
            status: 500,
            statusMessage: companiesError.message,
        });
    }

    console.info(`Creating ${CONTACT_STATUSES.length} contact statuses...`);
    const { data: contactStatusesData, error: contactStatusesError } = await supabase
        .from('Contact_Statuses')
        .insert(CONTACT_STATUSES.map((name) => ({ name })))
        .select();
    if (contactStatusesError) {
        console.error('Failed to create contact status', contactStatusesError);
        throw createError({
            status: 500,
            statusMessage: contactStatusesError.message,
        });
    }

    console.info(`Creating ${CONTACTS_AMOUNT} contacts...`);
    const { data: contactsData, error: contactsError } = await supabase
        .from('Contacts')
        .insert(
            Array.from({ length: CONTACTS_AMOUNT }, () => {
                const company_id = faker.helpers.arrayElement(companiesData).id;
                const province_id = faker.helpers.arrayElement(provincesData).id;
                const city_id = faker.helpers.arrayElement(citiesData.filter((city) => city.province_id === province_id)).id;
                const contact_status_id = faker.helpers.arrayElement(contactStatusesData).id;
                const sex = faker.person.sexType();
                const first_name = faker.person.firstName(sex);
                const last_name = faker.person.lastName(sex);
                const userName = faker.internet.userName({
                    firstName: first_name,
                    lastName: last_name,
                });
                const email = faker.internet.email({
                    firstName: first_name,
                    lastName: last_name,
                    allowSpecialCharacters: false,
                    provider: 'gmail.com',
                });

                return {
                    company_id,
                    city_id,
                    province_id,
                    country_id: country.id,
                    organization_id: ORGANIZATION_ID,
                    user_id: USER_ID,
                    first_name,
                    last_name,
                    email,
                    main_phone: faker.phone.number(),
                    // mobile_phone: faker.phone.number(),
                    job_title: faker.person.jobTitle(),
                    street_1: faker.location.streetAddress(),
                    // street_2: faker.location.streetAddress(),
                    // street_3: faker.location.streetAddress(),
                    postal_code: faker.location.zipCode(),
                    website: faker.internet.url({ protocol: 'https' }),
                    linkedin: `https://linkedin.com/in/${userName}`,
                    facebook: `https://facebook.com/${userName}`,
                    instagram: `https://instagram.com/${userName}`,
                    // description: faker.lorem.paragraph(),
                    contact_status_id,
                    is_valid_email: faker.datatype.boolean(),
                    // user_id: ,
                    created_at: faker.date.past().toISOString(),
                    updated_at: faker.date.recent().toISOString(),
                };
            })
        )
        .select('*');
    if (contactsError) {
        console.error('Failed to create contacts', contactsError);
        throw createError({
            status: 500,
            statusMessage: contactsError.message,
        });
    }

    console.info(`Creating ${RATINGS.length} ratings...`);
    const { data: ratingsData, error: ratingsError } = await supabase
        .from('Ratings')
        .insert(RATINGS.map((name) => ({ name })))
        .select();
    if (ratingsError) {
        console.error('Failed to create rating', ratingsError);
        throw createError({
            status: 500,
            statusMessage: ratingsError.message,
        });
    }

    console.info(`Creating ${SOURCES.length} sources...`);
    const { data: sourcesData, error: sourcesError } = await supabase
        .from('Sources')
        .insert(SOURCES.map((name) => ({ name })))
        .select();
    if (sourcesError) {
        console.error('Failed to create source', sourcesError);
        throw createError({
            status: 500,
            statusMessage: sourcesError.message,
        });
    }

    console.info(`Creating ${DISQUALIFY_REASONS.length} disqualify reasons...`);
    const { data: disqualifyReasonsData, error: disqualifyReasonsError } = await supabase
        .from('Disqualify_Reasons')
        .insert(DISQUALIFY_REASONS.map((name) => ({ name })))
        .select('*');
    if (disqualifyReasonsError) {
        console.error('Failed to create disqualify reason', disqualifyReasonsError);
        throw createError({
            status: 500,
            statusMessage: disqualifyReasonsError.message,
        });
    }

    console.info(`Creating ${LEAD_STATUSES.length} leads...`);
    const { data: leadsData, error: leadsError } = await supabase
        .from('Leads')
        .insert(
            contactsData.map((contact) => {
                const contact_id = contact.id;
                const company_id = faker.helpers.arrayElement(companiesData).id;
                const rating_id = faker.helpers.arrayElement(ratingsData).id;
                const source_id = faker.helpers.arrayElement(sourcesData).id;
                const lead_status = faker.helpers.arrayElement(LEAD_STATUSES);
                const disqualify_reason_id =
                    lead_status === 'disqualified' ? faker.helpers.arrayElement(disqualifyReasonsData).id : null;

                return {
                    company_id,
                    contact_id,
                    status: lead_status,
                    rating_id,
                    source_id,
                    organization_id: ORGANIZATION_ID,
                    user_id: USER_ID,
                    disqualify_reason_id,
                    topic: faker.lorem.sentence(),
                    // message: faker.lorem.paragraph(),
                    score: faker.number.int({ min: 1, max: 100 }),
                    created_at: faker.date.past().toISOString(),
                    updated_at: faker.date.recent().toISOString(),
                };
            })
        )
        .select('*');
    if (leadsError) {
        console.error('Failed to create leads', leadsError);
        throw createError({
            status: 500,
            statusMessage: leadsError.message,
        });
    }

    console.info(`Creating ${CLOSE_REASONS.length} close reasons...`);
    const { data: closeReasonsData, error: closeReasonsError } = await supabase
        .from('Close_Reasons')
        .insert(CLOSE_REASONS.map((name) => ({ name })))
        .select();
    if (closeReasonsError) {
        console.error('Failed to create close reason', closeReasonsError);
        throw createError({
            status: 500,
            statusMessage: closeReasonsError.message,
        });
    }

    console.info(`Creating ${PAYMENT_PLANS.length} payment plans...`);
    const { error: paymentPlansError } = await supabase
        .from('Payment_Plans')
        .insert(PAYMENT_PLANS.map((name) => ({ name })))
        .select();
    if (paymentPlansError) {
        console.error('Failed to create payment plans', paymentPlansError);
        throw createError({
            status: 500,
            statusMessage: paymentPlansError.message,
        });
    }

    console.info(`Creating ${OPPORTUNITY_STATUSES.length} opportunity statuses...`);
    const { data: opportunityStatusesData, error: opportunityStatusesError } = await supabase
        .from('Opportunity_Statuses')
        .insert(OPPORTUNITY_STATUSES.map((name, i) => ({ name, organization_id: ORGANIZATION_ID, index_number: i + 1 })))
        .select();
    if (opportunityStatusesError) {
        console.error('Failed to create opportunity status', opportunityStatusesError);
        throw createError({
            status: 500,
            statusMessage: opportunityStatusesError.message,
        });
    }

    function getRandomIds() {
        const company = faker.helpers.arrayElement(companiesData!);

        const contacts = contactsData?.filter((contact) => contact.company_id === company.id);
        if (!contacts || !contacts.length) return getRandomIds();

        const contact = faker.helpers.arrayElement(contacts);

        const leads = leadsData?.filter((lead) => lead.contact_id === contact.id);
        if (!leads || !leads.length) return getRandomIds();

        const lead = faker.helpers.arrayElement(leads);

        return { company_id: company.id, contact_id: contact.id, lead_id: lead.id };
    }

    console.info(`Creating ${OPPORTUNITIES_AMOUNT} opportunities...`);
    const {
        // data: opportunitiesData,
        error: opportunitiesError,
    } = await supabase
        .from('Opportunities')
        .insert(
            Array.from({ length: OPPORTUNITIES_AMOUNT }, (_, i) => {
                const { company_id, contact_id, lead_id } = getRandomIds();
                const opportunityStatus = faker.helpers.arrayElement(opportunityStatusesData);
                const close_reason_id =
                    opportunityStatus.name === 'lost' ? faker.helpers.arrayElement(closeReasonsData).id : null;

                const est_revenue = faker.number.int({ min: 500_000, max: 100_000_000 });
                const act_close_date = faker.date.recent().toISOString();
                const confidence = faker.number.int({ min: 1, max: 100 });

                return {
                    index_number: i + 1,
                    user_id: USER_ID,
                    organization_id: ORGANIZATION_ID,
                    company_id,
                    contact_id,
                    lead_id,
                    opportunity_status_id: opportunityStatus.id,
                    close_reason_id,
                    rating_id: faker.helpers.arrayElement(ratingsData).id,
                    topic: faker.lorem.sentence(),
                    est_revenue,
                    act_close_date,
                    confidence,
                    created_at: faker.date.past().toISOString(),
                    updated_at: faker.date.recent().toISOString(),
                };
            })
        )
        .select();
    if (opportunitiesError) {
        console.error('Failed to create opportunities', opportunitiesError);
        throw createError({
            status: 500,
            statusMessage: opportunitiesError.message,
        });
    }

    console.info('Seed successful');
    return { success: true };
});
