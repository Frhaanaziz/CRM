<script setup lang="ts">
import LazyModalSignOut from '~/components/modal/ModalSignOut.vue';
const emit = defineEmits(['close']);
const { user } = storeToRefs(userSessionStore());
const props = defineProps<{
    navigation: { name: string; href: string; icon: string; current: boolean }[];
}>();
const { navigation } = toRefs(props);

const modal = useModal();
function openLogOutModal() {
    modal.open(LazyModalSignOut, {
        onClose: () => modal.close(),
    });
}
</script>

<template>
    <div class="flex h-16 shrink-0 items-center">
        <NuxtImg class="h-6 w-auto" src="/logo.svg" alt="Pipeline logo" />
    </div>
    <nav class="flex flex-1 flex-col">
        <ul role="list" class="flex flex-1 flex-col gap-y-7">
            <li>
                <ul role="list" class="-mx-2 space-y-1">
                    <li v-for="item in navigation" :key="item.name">
                        <NuxtLink
                            :href="item.href"
                            class="text-weak flex gap-x-3 rounded p-2 text-sm font-semibold leading-6 transition"
                            :class="[
                                item.current
                                    ? 'border-l-4 border-l-brand'
                                    : 'border-l-4 border-l-transparent hover:border-l-brand',
                            ]"
                            @click="() => emit('close')"
                        >
                            <UIcon :name="item.icon" class="text-weak h-6 w-6 shrink-0" aria-hidden="true" />
                            {{ item.name }}
                        </NuxtLink>
                    </li>
                </ul>
            </li>
            <li class="-mx-6 mt-auto">
                <button
                    class="mx-4 flex items-center gap-x-2 rounded p-2 text-sm font-semibold text-red-500"
                    @click="
                        () => {
                            openLogOutModal();
                            emit('close');
                        }
                    "
                >
                    <UIcon name="i-heroicons-arrow-left-start-on-rectangle" class="h-6 w-6 shrink-0" aria-hidden="true" />
                    <span>Sign out</span>
                </button>
                <div v-if="user" class="flex items-center gap-x-3 px-6 py-3 text-xs font-semibold leading-6">
                    <UAvatar
                        :src="user.user_metadata?.photo ?? '/images/avatar-fallback.jpg'"
                        icon="i-heroicons-photo"
                        :alt="`${user.user_metadata.first_name} Avatar`"
                    />

                    <div>
                        <p>{{ truncateString(`${user.user_metadata?.first_name} ${user.user_metadata.last_name}`, 20) }}</p>
                        <p class="text-weak text-xs font-normal">
                            {{ truncateString(user?.email ?? '', 20) }}
                        </p>
                    </div>
                </div>
            </li>
        </ul>
    </nav>
</template>
