import { refDebounced } from '@vueuse/core';
import type { UnwrapRef } from 'vue';

interface FilterOptions<T> {
    search: string;
    page: number;
    limit: number;
    sort: keyof T;
    order: 'asc' | 'desc';
    filters?: Partial<Record<keyof T, string[]>>;
}

export function useFilterAndPaginate<T extends Record<string, any>>(data: Ref<T[]>) {
    const search = ref('');
    const debouncedSearch = refDebounced(search, 300);
    const page = ref(1);
    const pageCount = ref(10);
    const sort = ref({ column: 'created_at', direction: 'asc' as const });
    const filters = ref<Partial<Record<keyof T, string[]>>>({});

    const filteredData = computed(() => {
        const options: FilterOptions<T> = {
            search: debouncedSearch.value,
            page: page.value,
            limit: pageCount.value,
            sort: sort.value.column,
            order: sort.value.direction,
            filters: filters.value as Partial<Record<keyof T, string[]>>,
        };

        return filterAndPaginate(data.value, options);
    });

    const pageTotal = computed(() => data.value.length);

    const resetFilters = () => {
        search.value = '';
        // debouncedSearch.value = '';
        page.value = 1;
        filters.value = {} as UnwrapRef<Partial<Record<keyof T, string[]>>>;
    };

    return {
        search,
        page,
        pageCount,
        sort,
        filters,
        filteredData,
        pageTotal,
        resetFilters,
    };
}

function filterAndPaginate<T extends Record<string, any>>(data: T[], options: FilterOptions<T>): T[] {
    let filteredData = data.filter((item) => {
        const searchValue = JSON.stringify(item).toLowerCase();
        return searchValue.includes(options.search.toLowerCase());
    });

    for (const [key, filterValues] of Object.entries(options.filters || {})) {
        if (filterValues && filterValues.length > 0) {
            filteredData = filteredData.filter((item) => filterValues.includes(item[key] as string));
        }
    }

    const sortedData = filteredData.sort((a, b) => {
        const aValue = a[options.sort];
        const bValue = b[options.sort];

        if (!aValue || !bValue) return 0;

        if (aValue < bValue) return options.order === 'asc' ? -1 : 1;
        if (aValue > bValue) return options.order === 'asc' ? 1 : -1;
        return 0;
    });

    const startIndex = (options.page - 1) * options.limit;
    const endIndex = startIndex + options.limit;
    const paginatedData = sortedData.slice(startIndex, endIndex);

    return paginatedData;
}
