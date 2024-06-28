<script setup lang="ts">
import { z } from 'zod';
import type { FormSubmitEvent } from '#ui/types';
import type { Company, Contact } from '~/types';

const emit = defineEmits(['close']);
const closeModal = () => emit('close');

const user = useSupabaseUser();
if (!user.value || !user.value.user_metadata.organization_id) throw createError({ status: 401, message: 'Unauthorized' });

const contentType = ref<'add' | 'confirm'>('add');
const matchedContact = ref<(Contact & { company: Company | null })[] | undefined>(undefined);
const contact_id = ref<Contact['id'] | undefined>(undefined);

const { data: companies } = await useLazyFetch(`/api/organizations/${user.value.user_metadata.organization_id}/companies`);

const { schema, state, isSubmitting, isCreatingCompany, company, handleSubmit, companiesOptions } = useAddLead();

const { contactColumns, contactRows, selectedContact, selectContact, handleContinue, handleIgnore } = useConfirmLead();

function useAddLead() {
    const companiesOptions = computed(() => {
        if (!companies.value) return undefined;

        return companies.value.map((company) => ({
            id: company.id,
            name: company.name,
        }));
    });

    const schema = addLeadSchema.omit({ contact_id: true }).extend({
        company: z
            .array(
                z.object({
                    id: z.coerce.number(),
                    name: z.string(),
                })
            )
            .min(1, 'Please select at least one company')
            .max(1, 'Please select only one company'),
    });
    type AddLeadType = z.infer<typeof schema>;
    const isSubmitting = ref(false);
    const isCreatingCompany = ref(false);
    const state = ref<AddLeadType & { mobile_phone: string | undefined }>({
        first_name: '',
        last_name: '',
        email: '',
        mobile_phone: undefined,
        company: [],
        company_id: undefined as unknown as number,
        user_id: user.value!.id,
        organization_id: user.value!.user_metadata.organization_id,
    });
    const company = computed({
        get: () => state.value.company,
        set: async (companies) => {
            const promises = companies.map(async (company) => {
                if (company.id) return company;

                const newCompany = await $fetch('/api/companies', {
                    method: 'POST',
                    body: JSON.stringify({
                        name: company.name,
                        organization_id: user.value!.user_metadata.organization_id,
                        user_id: user.value!.id,
                    }),
                });

                companiesOptions.value?.unshift(newCompany);
                return newCompany;
            });

            isCreatingCompany.value = true;
            state.value.company_id = (await Promise.all(promises)).at(0)?.id ?? (undefined as unknown as number);
            state.value.company = await Promise.all(promises);
            isCreatingCompany.value = false;
        },
    });

    async function handleSubmit(event: FormSubmitEvent<AddLeadType>) {
        isSubmitting.value = true;

        let isNewContact = false;
        try {
            const contacts = await $fetch('/api/contacts/check', {
                params: {
                    organization_id: event.data.organization_id,
                    user_id: event.data.user_id,
                    email: event.data.email,
                    company_id: event.data.company_id,
                    first_name: event.data.first_name,
                    last_name: event.data.last_name,
                },
            });

            matchedContact.value = contacts;
        } catch (error) {
            if (getErrorCode(error) === 404) {
                const contact = await $fetch('/api/contacts', {
                    method: 'POST',
                    body: JSON.stringify({
                        first_name: event.data.first_name,
                        last_name: event.data.last_name,
                        email: event.data.email,
                        organization_id: event.data.organization_id,
                        user_id: event.data.user_id,
                        company_id: event.data.company_id,
                    }),
                });

                contact_id.value = contact.id;
                isNewContact = true;
            } else {
                console.error('Failed to check contact', error);
                toast.error('Failed to add lead, please try again later.');
                isSubmitting.value = false;
                return;
            }
        }

        if (!contact_id.value && !isNewContact && !!matchedContact.value?.length) {
            contentType.value = 'confirm';

            isSubmitting.value = false;
            return;
        }

        try {
            await $fetch('/api/leads', {
                method: 'POST',
                body: JSON.stringify({
                    ...event.data,
                    contact_id: contact_id.value,
                }),
            });

            closeModal();
            toast.success('Lead added successfully.');
            await refreshNuxtData('leads');
        } catch (e) {
            console.error('Failed to add lead', e);
            toast.error('Failed to add lead, please try again later.');
        }
        isSubmitting.value = false;
    }

    return { schema, state, isSubmitting, isCreatingCompany, company, handleSubmit, companiesOptions };
}
function useConfirmLead() {
    const contactColumns = [
        {
            key: 'select',
            label: '✓',
        },
        {
            key: 'fullName',
            label: 'Full Name',
        },
        {
            key: 'email',
            label: 'Email',
        },
        {
            key: 'companyName',
            label: 'Company Name',
        },
        {
            key: 'phone',
            label: 'Business Phone',
        },
    ];
    const contactRows = computed(() => {
        if (!matchedContact.value) return undefined;

        return matchedContact.value.map((contact) => ({
            id: contact.id,
            fullName: `${contact.first_name} ${contact.last_name}`,
            email: contact.email,
            companyName: contact.company?.name,
            phone: contact.main_phone,
        }));
    });

    const selectedContact = ref<Contact['id'][]>([]);
    function selectContact(row: Pick<Contact, 'id'>) {
        const index = selectedContact.value.findIndex((id) => id === row.id);
        if (index === -1) {
            selectedContact.value.push(row.id);
        } else {
            selectedContact.value.splice(index, 1);
        }
    }

    async function handleContinue() {
        if (!selectedContact.value.length) {
            toast.error('Please select a contact to continue.');
            return;
        }

        try {
            isSubmitting.value = true;

            await $fetch('/api/leads', {
                method: 'POST',
                body: JSON.stringify({
                    ...state.value,
                    contact_id: selectedContact.value.at(0),
                }),
            });

            closeModal();
            toast.success('Lead added successfully.');
            await refreshNuxtData('leads');
        } catch (e) {
            console.error('Failed to add lead', e);
            toast.error('Failed to add lead, please try again later.');
        } finally {
            isSubmitting.value = false;
        }
    }

    async function handleIgnore() {
        try {
            isSubmitting.value = true;

            const newContact = await $fetch('/api/contacts', {
                method: 'POST',
                body: JSON.stringify({
                    first_name: state.value.first_name,
                    last_name: state.value.last_name,
                    email: state.value.email,
                    organization_id: state.value.organization_id,
                    user_id: state.value.user_id,
                    company_id: state.value.company_id,
                }),
            });

            await $fetch('/api/leads', {
                method: 'POST',
                body: JSON.stringify({
                    ...state.value,
                    contact_id: newContact.id,
                }),
            });

            closeModal();
            toast.success('Lead added successfully.');
            await refreshNuxtData('leads');
        } catch (e) {
            console.error('Failed to add lead', e);
            toast.error('Failed to add lead, please try again later.');
        } finally {
            isSubmitting.value = false;
        }
    }

    return { contactColumns, contactRows, selectedContact, selectContact, handleContinue, handleIgnore };
}
</script>

<template>
    <UModal
        :ui="{
            width: contentType === 'add' ? 'sm:max-w-sm' : 'sm:max-w-3xl',
        }"
    >
        <template v-if="contentType === 'add'">
            <div class="flex items-center justify-between p-3">
                <p class="text-lg font-semibold leading-6 text-gray-900 dark:text-white">Add New Lead</p>
                <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1" @click="closeModal" />
            </div>

            <div class="space-y-3 bg-base-200 p-3">
                <UForm
                    :schema="schema"
                    :state="state"
                    class="space-y-3"
                    :validateOn="['submit']"
                    @submit="handleSubmit"
                    @error="console.error"
                >
                    <UFormGroup label="First Name" name="first_name" required>
                        <UInput
                            v-model="state.first_name"
                            :disabled="isSubmitting"
                            :loading="isSubmitting"
                            placeholder="Enter First Name"
                        />
                    </UFormGroup>

                    <UFormGroup label="Last Name" name="last_name" required>
                        <UInput
                            v-model="state.last_name"
                            :disabled="isSubmitting"
                            :loading="isSubmitting"
                            placeholder="Enter Last Name"
                        />
                    </UFormGroup>

                    <UFormGroup label="Email" name="email" required>
                        <UInput
                            v-model="state.email"
                            :disabled="isSubmitting"
                            :loading="isSubmitting"
                            placeholder="Enter Email"
                        />
                    </UFormGroup>

                    <UFormGroup label="Mobile Phone" name="mobile_phone">
                        <UInput
                            v-model="state.mobile_phone"
                            :disabled="isSubmitting"
                            :loading="isSubmitting"
                            placeholder="Enter Mobile Phone"
                        />
                    </UFormGroup>

                    <UFormGroup label="Company Name" name="company" required>
                        <USelectMenu
                            v-model="company"
                            by="id"
                            :options="companiesOptions"
                            option-attribute="name"
                            searchable
                            searchable-placeholder="Search a company..."
                            creatable
                            show-create-option-when="always"
                            multiple
                            clear-search-on-close
                            placeholder="Select Company"
                            :loading="isSubmitting || isCreatingCompany"
                            :disabled="isSubmitting || isCreatingCompany"
                        />
                    </UFormGroup>

                    <div class="flex items-center justify-end gap-2">
                        <UButton type="button" variant="outline" :disabled="isSubmitting" @click="closeModal">Cancel</UButton>
                        <UButton type="submit" :disabled="isSubmitting" :loading="isSubmitting">Save</UButton>
                    </div>
                </UForm>
            </div>
        </template>

        <template v-else>
            <div class="flex items-center justify-between p-3">
                <p class="text-lg font-semibold leading-6 text-gray-900 dark:text-white">Contact May Already Exist</p>
                <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1" @click="closeModal" />
            </div>

            <div class="bg-base-200 p-3">
                <p class="text-weak mb-3">
                    Associate the lead to existing records by choosing contact and clicking continue. To proceed by without
                    linking to matched record, click Ignore and Save.
                </p>

                <div class="spacey-y-3 my-3">
                    <p class="font-semibold text-brand">Matched Contacts</p>

                    <!-- v-model="selectedContact" -->
                    <UTable
                        by="id"
                        :rows="contactRows"
                        :columns="contactColumns"
                        class="w-full"
                        :ui="{
                            tr: { base: '[&>td]:hover:bg-base-200' },
                            td: { base: 'max-w-[0] truncate text-default' },
                        }"
                        @select="selectContact"
                    >
                        <template #select-data="{ row }">
                            <UCheckbox v-model="selectedContact" :value="row.id" />
                        </template>
                    </UTable>
                </div>

                <div class="mt-3 flex items-center justify-end gap-2">
                    <UButton type="button" variant="outline" :disabled="isSubmitting" @click="closeModal">Cancel</UButton>
                    <UButton :disabled="isSubmitting || !!selectedContact.length" @click="handleIgnore">Ignore and Save</UButton>
                    <UButton :disabled="isSubmitting || !!!selectedContact.length" @click="handleContinue">Continue</UButton>
                </div>
            </div>
        </template>
    </UModal>
</template>
