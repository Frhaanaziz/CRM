import { refDebounced } from '@vueuse/core';
import type { UnwrapRef } from 'vue';

interface Column {
    key: string;
    sortable?: boolean;
    sort?: (a: any, b: any, direction: 'asc' | 'desc') => number;
    direction?: 'asc' | 'desc';
    class?: string;
    [key: string]: any;
}

interface DataTableOptions<T> {
    columns: Column[];
    initialColumnKeys?: string[];
    defaultSort?: { column: keyof T; direction: 'asc' | 'desc' };
    defaultPageSize?: number;
}

export function useDataTable<T extends { id: string | number }>(options: DataTableOptions<T>) {
    const {
        columns,
        initialColumnKeys = [],
        defaultSort = { column: 'created_at' as keyof T, direction: 'desc' },
        defaultPageSize = 10,
    } = options;

    const selectedColumns = ref(
        columns.filter((column) => initialColumnKeys.length === 0 || initialColumnKeys.includes(column.key))
    );
    const tableColumns = computed(() =>
        columns.filter((column) => selectedColumns.value.some((selected) => selected.key === column.key))
    );

    // Selected Rows
    const selectedRows = ref<Pick<T, 'id'>[]>([]);
    function selectRow(row: { id: UnwrapRef<T['id']> }) {
        const index = selectedRows.value.findIndex((item) => item.id === row.id);
        if (index === -1) {
            selectedRows.value.push(row);
        } else {
            selectedRows.value.splice(index, 1);
        }
    }

    const search = ref('');
    const debouncedSearch = refDebounced(
        computed(() => search.value.trim()),
        300
    );
    const page = ref(1);
    const pageSize = ref(defaultPageSize);
    const sort = ref(defaultSort);

    // Reset page when search changes
    watch(debouncedSearch, () => {
        page.value = 1;
    });

    return {
        search,
        debouncedSearch,
        page,
        pageSize,
        sort,
        selectedColumns,
        tableColumns,
        columns,
        selectedRows,
        selectRow,
    };
}
