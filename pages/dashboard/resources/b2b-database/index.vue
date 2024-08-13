<script setup lang="ts">
const companyRecommendation = [
    {
        id: 4916,
        name: 'Badr Interactive',
        avatar: 'https://media.licdn.com/dms/image/C560BAQEapJBXD--rEQ/company-logo_200_200/0/1631315970076?e=2147483647&v=beta&t=EkiGQAnpYmxZK5Ya1BUdOwcNm06DygQy2n4qapEhRsk',
        industry: {
            name: 'IT Services and IT Consulting',
        },
        size: {
            size_range: '51-200',
        },
    },
    {
        id: 2955,
        name: 'Mekari',
        avatar: 'https://media.licdn.com/dms/image/D560BAQEy-QSiDSQhLQ/company-logo_200_200/0/1689148487268/mekari_logo?e=2147483647&v=beta&t=dG0frrbe5X9BGheS61sRfXF3eyxxAbAfrX7K9L7W0KA',
        industry: {
            name: 'Software Development',
        },
        size: {
            size_range: '1001-5000',
        },
    },
    {
        id: 7934,
        name: 'GDP Labs',
        avatar: 'https://media.licdn.com/dms/image/C4D0BAQHpXhPivbZyzA/company-logo_200_200/0/1631344855842?e=2147483647&v=beta&t=fJpeJKzfeKhViPN8luT8bYmk64GGtPmAfVmZBucua14',
        industry: {
            name: 'IT Services and IT Consulting',
        },
        size: {
            size_range: '201-500',
        },
    },
    {
        id: 14183,
        name: 'SeaBank Indonesia',
        avatar: 'https://media.licdn.com/dms/image/v2/C560BAQGSx9TI_MAERQ/company-logo_200_200/company-logo_200_200/0/1630645359139/seabank_indonesia_logo?e=2147483647&v=beta&t=L8v061XrpJzyx6rVpvOVlbqwCaswywvn-A7-8qGRPMU',
        industry: {
            name: 'Banking',
        },
        size: {
            size_range: '1001-5000',
        },
    },
    {
        id: 6313,
        name: 'Qlue AI',
        website: 'http://qluework.com',
        avatar: 'https://media.licdn.com/dms/image/C510BAQH39cPYIBscsQ/company-logo_200_200/0/1630617321305/qluesmartcity_logo?e=2147483647&v=beta&t=5h7QM1zzhoV00ZV1xtpYkRzD4jOmGId9Z21o9N8jVqc',
        industry: {
            name: 'Information Technology & Services',
        },
        size: {
            size_range: '51-200',
        },
    },
    {
        id: 2376,
        name: 'OFON',
        website: 'http://www.ofon.co.id',
        avatar: 'https://media.licdn.com/dms/image/C560BAQGNhtbEqfzDog/company-logo_200_200/0/1631363115362?e=2147483647&v=beta&t=xwYvE7GZKHCQuuVMrGHJedYX8XDwi0PaJISPKv6tFTc',
        industry: {
            name: 'Telecommunications',
        },
        size: {
            size_range: '51-200',
        },
    },
];
</script>

<template>
    <div>
        <h1 class="border-b p-4 text-xl font-semibold">Company Database</h1>

        <section class="space-y-2 bg-gray-50 p-4">
            <h2 class="text-xl font-semibold text-slate-700">Our Recommendation</h2>
            <ul class="grid grid-cols-3 gap-2">
                <li v-for="company in companyRecommendation" :key="company.id">
                    <NuxtLink
                        :href="`/dashboard/resources/b2b-database/${company.id}`"
                        class="flex items-center gap-4 rounded-lg border bg-white p-4"
                    >
                        <UAvatar :src="company.avatar" size="2xl" />
                        <div class="space-y-1">
                            <h3 class="text-xl font-semibold">{{ company.name }}</h3>
                            <p class="flex items-center text-sm text-slate-700">
                                <UIcon name="i-heroicons-building-office" />
                                {{ company.industry.name }}
                            </p>
                            <p class="flex items-center text-sm text-slate-700">
                                <UIcon name="i-heroicons-user" />
                                {{ company.size.size_range }}
                            </p>
                        </div>
                    </NuxtLink>
                </li>
            </ul>
        </section>

        <TableB2BCompanies />
    </div>
</template>
