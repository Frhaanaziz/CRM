import { faker } from '@faker-js/faker';
import { z } from 'zod';
import { getZodErrorMessage } from '~/utils';
import type { B2BCompany, City, Company, CompanyStatus, Contact, Lead, LeadStatus, Rating } from '~/types';
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
const SIZE_RANGE = [
    { size_range: '1-10' },
    { size_range: '11-50' },
    { size_range: '51-200' },
    { size_range: '201-500' },
    { size_range: '501-1000' },
    { size_range: '1001-5000' },
    { size_range: '5001-10000' },
    { size_range: '10001+' },
];
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
        await supabase.from('Companies').delete().neq('id', 0).throwOnError();
        await supabase.from('Company_Statuses').delete().neq('id', 0).throwOnError();
        await supabase.from('Industries').delete().neq('id', 0).throwOnError();
        await supabase.from('Contacts').delete().neq('id', 0).throwOnError();
        await supabase.from('Contact_Statuses').delete().neq('id', 0).throwOnError();
        await supabase.from('Leads').delete().neq('id', 0).throwOnError();
        await supabase.from('Lead_Statuses').delete().neq('id', 0).throwOnError();
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
        SIZE_RANGE.map(async (size) => {
            const sizeRes = await supabase.from('Sizes').insert(size).select().single();
            if (!sizeRes.data) throw new Error('Failed to create size');

            return sizeRes.data;
        })
    );

    console.info('Creating B2B Companies...');
    const B2BCompaniesData: B2BCompany[] = [];
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
        B2BCompaniesData.push(companyRes.data);
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

    console.info('Creating Company Statuses...');
    const companyStatusesData: CompanyStatus[] = [];
    await Promise.allSettled(
        COMPANY_STATUSES.map(async (name) => {
            const res = await supabase.from('Company_Statuses').insert({ name }).select().single();
            if (res.error) {
                console.error('Failed to create company status', res.error);
                throw createError({
                    status: 500,
                    statusMessage: res.error.message,
                });
            }

            companyStatusesData.push(res.data);
        })
    );

    console.info('Creating Companies');
    const companiesData: Company[] = [];
    for (let i = 0; i < COMPANIES_AMOUNT; i++) {
        const name = faker.company.name();
        const province_id = parseInt(faker.helpers.arrayElement(provincesData).id);
        const city_id = faker.helpers.arrayElement(citiesData.filter((city) => city.province_id === province_id)).id;
        const industry_id = faker.helpers.arrayElement(industriesData).id;
        const company_status_id = faker.helpers.arrayElement(companyStatusesData).id;

        const companyRes = await supabase
            .from('Companies')
            .insert({
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

        companiesData.push(companyRes.data);
        console.info(`Created company ${i + 1}/${COMPANIES_AMOUNT}`);
    }

    console.info('Creating Contact Statuses...');
    const contactStatusesData = await Promise.all(
        CONTACT_STATUSES.map(async (name) => {
            const { data, error } = await supabase.from('Contact_Statuses').insert({ name }).select().single();
            if (error) {
                console.error('Failed to create contact status', error);
                throw createError({
                    status: 500,
                    statusMessage: error.message,
                });
            }

            return data;
        })
    );

    console.info('Creating Contacts...');
    const contactsData: Contact[] = [];
    for (let i = 0; i < CONTACTS_AMOUNT; i++) {
        const company_id = faker.helpers.arrayElement(companiesData).id;
        const province_id = parseInt(faker.helpers.arrayElement(provincesData).id);
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

        const contactRes = await supabase
            .from('Contacts')
            .insert({
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
            })
            .select()
            .single();
        if (contactRes.error) {
            console.error('Failed to create contact', contactRes.error);
            throw createError({
                status: 500,
                statusMessage: contactRes.error.message,
            });
        }

        contactsData.push(contactRes.data);
        console.info(`Created contact ${i + 1}/${CONTACTS_AMOUNT}`);
    }

    console.info('Creating Ratings...');
    const ratingsData: Rating[] = [];
    await Promise.allSettled(
        RATINGS.map(async (name) => {
            const res = await supabase.from('Ratings').insert({ name }).select().single();
            if (res.error) {
                console.error('Failed to create rating', res.error);
                throw createError({
                    status: 500,
                    statusMessage: res.error.message,
                });
            }

            ratingsData.push(res.data);
        })
    );

    console.info('Creating Lead Statuses...');
    const leadStatusesData: LeadStatus[] = [];
    await Promise.allSettled(
        LEAD_STATUSES.map(async (name) => {
            const res = await supabase.from('Lead_Statuses').insert({ name }).select().single();
            if (res.error) {
                console.error('Failed to create lead status', res.error);
                throw createError({
                    status: 500,
                    statusMessage: res.error.message,
                });
            }

            leadStatusesData.push(res.data);
        })
    );

    console.info('Creating Sources...');
    const sourcesData = await Promise.all(
        SOURCES.map(async (name) => {
            const res = await supabase.from('Sources').insert({ name }).select().single();
            if (res.error) {
                console.error('Failed to create source', res.error);
                throw createError({
                    status: 500,
                    statusMessage: res.error.message,
                });
            }

            return res.data;
        })
    );

    console.info('Creating Disqualify Reasons...');
    const disqualifyReasonsData = await Promise.all(
        DISQUALIFY_REASONS.map(async (name) => {
            const res = await supabase.from('Disqualify_Reasons').insert({ name }).select().single();
            if (res.error) {
                console.error('Failed to create disqualify reason', res.error);
                throw createError({
                    status: 500,
                    statusMessage: res.error.message,
                });
            }

            return res.data;
        })
    );

    console.info('Creating leads...');
    const leadsData: Lead[] = [];
    for (let i = 0; i < contactsData.length; i++) {
        const contact_id = contactsData[i].id;
        const company_id = faker.helpers.arrayElement(companiesData).id;
        const rating_id = faker.helpers.arrayElement(ratingsData).id;
        const source_id = faker.helpers.arrayElement(sourcesData).id;
        const lead_status = faker.helpers.arrayElement(leadStatusesData);
        const disqualify_reason_id =
            lead_status.name === 'disqualified' ? faker.helpers.arrayElement(disqualifyReasonsData).id : null;

        const leadRes = await supabase
            .from('Leads')
            .insert({
                company_id,
                contact_id,
                lead_status_id: lead_status.id,
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
            })
            .select()
            .single();
        if (leadRes.error) {
            console.error('Failed to create lead', leadRes.error);
            throw createError({
                status: 500,
                statusMessage: leadRes.error.message,
            });
        }

        leadsData.push(leadRes.data);
        console.info(`Created lead ${i + 1}/${contactsData.length}`);
    }

    console.info('Creating close reasons...');
    // const closeReasonsData = await Promise.all(
    //     CLOSE_REASONS.map(async (name) => {
    //         const res = await supabase.from('Close_Reasons').insert({ name }).select().single();
    //         if (res.error) {
    //             console.error('Failed to create close reason', res.error);
    //             throw createError({
    //                 status: 500,
    //                 statusMessage: res.error.message,
    //             });
    //         }

    //         return res.data;
    //     })
    // );
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

    console.info('Creating opportunity statuses...');
    const { data: opportunityStatusesData, error: opportunityStatusesError } = await supabase
        .from('Opportunity_Statuses')
        .insert(OPPORTUNITY_STATUSES.map((name) => ({ name, organization_id: ORGANIZATION_ID })))
        .select();
    if (opportunityStatusesError) {
        console.error('Failed to create opportunity status', opportunityStatusesError);
        throw createError({
            status: 500,
            statusMessage: opportunityStatusesError.message,
        });
    }

    function getRandomIds() {
        const company = faker.helpers.arrayElement(companiesData);

        const contacts = contactsData.filter((contact) => contact.company_id === company.id);
        if (!contacts.length) return getRandomIds();

        const contact = faker.helpers.arrayElement(contacts);

        const leads = leadsData.filter((lead) => lead.contact_id === contact.id);
        if (!leads.length) return getRandomIds();

        const lead = faker.helpers.arrayElement(leads);

        return { company_id: company.id, contact_id: contact.id, lead_id: lead.id };
    }

    console.info('Creating opportunities...');
    const {
        // data: opportunitiesData,
        error: opportunitiesError,
    } = await supabase
        .from('Opportunities')
        .insert(
            Array.from({ length: OPPORTUNITIES_AMOUNT }, () => {
                const { company_id, contact_id, lead_id } = getRandomIds();
                const opportunityStatus = faker.helpers.arrayElement(opportunityStatusesData);
                const close_reason_id =
                    opportunityStatus.name === 'lost' ? faker.helpers.arrayElement(closeReasonsData).id : null;

                const est_revenue = faker.number.int({ min: 500_000, max: 100_000_000 });
                const act_close_date = faker.date.recent().toISOString();
                const confidence = faker.number.int({ min: 1, max: 100 });

                return {
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
