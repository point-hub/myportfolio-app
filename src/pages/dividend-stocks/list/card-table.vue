<script setup lang="ts">
import { watchDebounced } from '@vueuse/core';
import { onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import BaseDateRangePicker from '@/components/base-date-range-picker.vue';
import TableSettingModal from '@/components/table-setting-modal.vue';
import { getDividendStocksApi, type IDividendStockData } from '@/composables/api/dividend-stocks/get.api';
import { useQueryParams } from '@/composables/query-params';
import { useTableFilter } from '@/composables/table-filter';
import { useTableSetting } from '@/composables/table-setting';
import { useAuthStore } from '@/stores/auth.store';
import { toast } from '@/toast';
import { handleError } from '@/utils/api';
import { formatNumber } from '@/utils/number';

import ModalDelete from '../components/delete-modal/index.vue';

/**
 * Setup table columns and visibility state using the useTableSetting composable.
 */
const {
  isOpen,
  open,
  close,
  columns,
  visibleColumns,
  countVisibleColumns,
  pageSize,
  pageSizeOptions,
  resetTableSetting,
} = useTableSetting({
  columns: {
    status: { label: 'Status', isVisible: true, isSelectable: true },
    form_number: { label: 'Form Number', isVisible: true, isSelectable: true },
    'dividend_date': { label: 'Dividend Date', isVisible: true, isSelectable: true },
    'broker.name': { label: 'Broker', isVisible: true, isSelectable: true },
    'bank.account.account_name': { label: 'Account Name', isVisible: true, isSelectable: true },
    'bank.account.account_number': { label: 'Account Number', isVisible: true, isSelectable: true },
    'transactions.owner.name': { label: 'Owner', isVisible: true, isSelectable: true },
    'total_received': { label: 'Total Received', isVisible: true, isSelectable: true },
    notes: { label: 'Notes', isVisible: false, isSelectable: true },
    is_archived: { label: 'Is Archived', isVisible: false, isSelectable: true },
  },
});

/**
 * Setup filtering, sorting, and pagination state using the useTableFilter composable.
 */
const {
  filter,
  resetFilter,
  sort,
  sortObjectToString,
  toggleSort,
  pagination,
  resetPagination,
} = useTableFilter({
  initialFilter: {
    all: '',
    status: '',
    form_number: '',
    'dividend_date': '',
    'broker.name': '',
    'bank.account.account_name': '',
    'bank.account.account_number': '',
    'transactions.owner.name': '',
    'total_received': '',
    notes: '',
    is_archived: 'false',
  },
  initialSortKeys: {
    status: 0,
    form_number: 0,
    'dividend_date': 0,
    'broker.name': 0,
    'bank.account.account_name': 0,
    'bank.account.account_number': 0,
    'transactions.owner.name': 0,
    'total_received': 0,
    notes: 0,
    is_archived: 0,
  },
});

/**
 * Utilities for updating query parameters in the URL.
 */
const { updateQueryParams, applyQueryParams } = useQueryParams();
const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

/**
 * Reactive references for:
 * - dividend stock data retrieved from API
 * - loading state
 * - control flags to prevent unnecessary watcher triggers
 */
const dividendStocks = ref<IDividendStockData[]>();
const isInitialSetup = ref(true);
const isLoading = ref(false);
const archivedOptions = ref([{ label: 'Yes', value: 'true' }, { label: 'No', value: 'false' }]);
const statusOptions = ref([
  { label: 'Draft', value: 'draft' },
  { label: 'Active', value: 'active' },
]);

/**
 * References for dynamic UI components like row menus and delete modal.
 */
const rowMenuRef = ref();
const deleteModalRef = ref();

/**
 * Function triggered when pagination page changes.
 * Fetches new data for the updated page and updates query params.
 */
const onPageUpdate = async () => {
  if (!isInitialSetup.value) {
    await getDividendStocks(pagination.page);
    await updateQueryParams({ 'page': pagination.page.toString() });
  }
};

/**
 * Reset pagination to first page and fetch data accordingly.
 */
const resetPageAndFetch = async () => {
  pagination.page = 1;
  await updateQueryParams({ page: 1 });
  await getDividendStocks();
};

/**
 * Fetch data from API based on current filters, sorting, and pagination.
 * Manages loading state and error handling with user notifications.
 * @param page - Current page number to fetch (default 1)
 */
const getDividendStocks = async (page = 1) => {
  try {
    isLoading.value = true;
    const response = await getDividendStocksApi({
      search: filter,
      sort: sortObjectToString(sort),
      page,
      page_size: pagination.page_size,
    });
    dividendStocks.value = response.data;
    Object.assign(pagination, response.pagination);
  } catch (error) {
    const errorResponse = handleError(error);
    if (errorResponse.message) {
      toast(errorResponse.message, {
        lists: errorResponse.lists,
        color: 'danger',
      });
    }
  } finally {
    isLoading.value = false;
  }
};

/**
 * Handler to reset all filters, sorting, pagination, and table settings.
 * Clears URL query parameters and fetches default data.
 */
const onResetFilter = async () => {
  isInitialSetup.value = true;

  // Clear all query params from URL
  await router.push({ query: undefined });

  // Reset pagination, table settings, filter, and sort states
  resetPagination(pageSize.value.size);
  resetTableSetting();
  resetFilter();

  // Fetch data without any filters applied
  await getDividendStocks();

  setTimeout(() => { isInitialSetup.value = false; }, 1000);
};

/**
 * Opens the delete confirmation modal for a specific dividend stock.
 * Also closes the row menu popover.
 * @param dividendStock - The data row to delete
 * @param index - Index of the row for UI references
 */
const onDeleteModal = (dividendStock: IDividendStockData, index: number) => {
  rowMenuRef.value[index].toggle(false);
  deleteModalRef.value.toggleModal({
    _id: dividendStock._id,
    label: `${dividendStock.form_number}`,
  });
};

/**
 * Handler called after a successful deletion.
 * Refreshes the data list.
 */
const onDeleted = async () => {
  await getDividendStocks();
};

/**
 * Lifecycle hook: runs when component is mounted.
 * Applies query params to state and fetches initial data.
 */
onMounted(async () => {
  isInitialSetup.value = true;

  // Set initial page size from table setting
  pagination.page_size = pageSize.value.size;

  // Apply query params from route to filter, sort, pagination, columns
  applyQueryParams({
    query: route.query,
    filter,
    sort,
    pagination,
    pageSize,
    pageSizeOptions,
    columns,
  });

  // Fetch initial data
  await getDividendStocks(pagination.page);

  setTimeout(() => { isInitialSetup.value = false; }, 1000);
});

/**
 * Watcher for filter changes with debounce to reduce API calls.
 * Resets page to 1 and fetches data on filter change.
 * Skips if flagged to prevent API calls on initial setup or manual resets.
 */
watchDebounced(filter, async () => {
  if (!isInitialSetup.value) {
    await updateQueryParams({ search: filter });
    await resetPageAndFetch();
  }
}, { debounce: 500, maxWait: 1000 });

/**
 * Watcher for page size changes.
 * Updates pagination and query params, then fetches data.
 */
watch(pageSize, async () => {
  if (!isInitialSetup.value) {
    pagination.page_size = pageSize.value.size;
    await updateQueryParams({ 'page-size': pagination.page_size.toString() });
    await resetPageAndFetch();
  }
});

/**
 * Watcher for visible columns changes.
 * Updates query params to reflect visible columns.
 */
watch(visibleColumns, async () => {
  if (!isInitialSetup.value) {
    await updateQueryParams({ 'columns': visibleColumns.value });
  }
});

/**
 * Watcher for sort state changes.
 * Updates query params and fetches data accordingly.
 */
watch(sort, async () => {
  if (!isInitialSetup.value) {
    await updateQueryParams({ sort: sortObjectToString(sort) });
    await resetPageAndFetch();
  }
});
</script>

<template>
  <base-card title="Dividend Stocks">
    <div class="flex flex-col lg:flex-row gap-2 items-center justify-between mb-8">
      <div class="flex-1 w-full">
        <base-input v-model="filter.all" placeholder="Search..." border="full" :readonly="isLoading">
          <template #prefix>
            <base-icon icon="i-fa7-solid-magnifying-glass" />
          </template>
        </base-input>
      </div>
      <div class="flex gap-1">
        <router-link v-if="authStore.hasPermission('dividend-stocks:create')" to="/dividend-stocks/create">
          <base-button color="primary" shape="sharp" class="font-bold">
            <base-icon class="i-lucide:square-plus" /> CREATE
          </base-button>
        </router-link>
        <base-button color="info" @click="open()" :disabled="isLoading" class="font-bold">
          <base-icon class="i-ph:sliders-horizontal-bold" />
        </base-button>
      </div>
    </div>

    <div class="flex flex-col gap-4">
      <base-table>
        <thead>
          <tr>
            <th class="w-1"></th>
            <!-- Render visible column headers with sortable buttons -->
            <template v-for="(column, key) in columns">
              <th :key="key" v-if="columns[key]?.isVisible">
                <div class="flex items-center gap-2 whitespace-nowrap">
                  <base-button size="xs" class="p-0!" @click="toggleSort(key)">
                    <base-icon v-if="sort[key] === 0" icon="i-solar:square-sort-vertical-outline" />
                    <base-icon v-if="sort[key] === 1" icon="i-heroicons-solid:sort-ascending" />
                    <base-icon v-if="sort[key] === -1" icon="i-heroicons-solid:sort-descending" />
                  </base-button>
                  <span>{{ column.label }}</span>
                </div>
              </th>
            </template>
          </tr>

          <tr class="bg-slate-100 dark:bg-slate-700">
            <th class="w-1"></th>

            <!-- Render filter inputs for visible columns -->
            <th v-if="columns['status']?.isVisible">
              <base-choosen
                placeholder="Search..."
                title="Status"
                v-model:options="statusOptions"
                v-model="filter.status"
                border="none"
                paddingless
              />
            </th>
            <th v-if="columns['form_number']?.isVisible">
              <base-input v-model="filter.form_number" placeholder="Search..." :readonly="isLoading" border="none" paddingless />
            </th>
            <th v-if="columns['dividend_date']?.isVisible">
              <base-date-range-picker
                v-model:date_from="filter['dividend_date_from']"
                v-model:date_to="filter['dividend_date_to']"
                placeholder="Search..."
                :readonly="isLoading"
                border="none"
                paddingless
              />
            </th>

            <th v-if="columns['broker.name']?.isVisible">
              <base-input v-model="filter['broker.name']" placeholder="Search..." :readonly="isLoading" border="none" paddingless />
            </th>
            <th v-if="columns['bank.account.account_name']?.isVisible">
              <base-input v-model="filter['bank.account.account_name']" placeholder="Search..." :readonly="isLoading" border="none" paddingless />
            </th>
            <th v-if="columns['bank.account.account_number']?.isVisible">
              <base-input v-model="filter['bank.account.account_number']" placeholder="Search..." :readonly="isLoading" border="none" paddingless />
            </th>
            <th v-if="columns['transactions.owner.name']?.isVisible">
              <base-input v-model="filter['transactions.owner.name']" placeholder="Search..." :readonly="isLoading" border="none" paddingless />
            </th>
            <th v-if="columns['total_received']?.isVisible">
              <base-input v-model="filter['total_received']" placeholder="Search..." :readonly="isLoading" border="none" paddingless />
            </th>
            <th v-if="columns['notes']?.isVisible">
              <base-input v-model="filter.notes" placeholder="Search..." :readonly="isLoading" border="none" paddingless />
            </th>
            <th v-if="columns['is_archived']?.isVisible">
              <base-choosen
                placeholder="Search..."
                title="Is Archived"
                v-model:options="archivedOptions"
                v-model="filter.is_archived"
                border="none"
                paddingless
              />
            </th>
          </tr>
        </thead>

        <tbody>
          <!-- Loading state with loader spanning all columns -->
          <tr v-if="isLoading">
            <td :colspan="countVisibleColumns + 1">
              <p class="w-full p-10 h-32 flex items-center gap-2 text-xl">
                <base-loader type="classic" sample="2" />
              </p>
            </td>
          </tr>

          <!-- Show no data found message if no dividendStocks and query params exist -->
          <tr v-if="!isLoading && dividendStocks?.length === 0 && route.query">
            <td :colspan="countVisibleColumns + 1">
              <div class="w-full flex-col p-10 items-center justify-center gap-2">
                <p class="text-xl">Data Not Found</p>
                <base-button @click="onResetFilter" variant="filled" color="primary" class="my-2 px-4!">
                  Reset Filter
                </base-button>
              </div>
            </td>
          </tr>

          <!-- Render rows of dividend stock data when available -->
          <template v-if="!isLoading && dividendStocks && dividendStocks.length > 0">
            <tr v-for="(dividendStock, index) in dividendStocks" :key="index" :class="{'bg-red-50 dark:bg-red-800': dividendStock.status === 'draft'}">
              <td>
                <!-- Row action menu -->
                <base-popover placement="bottom" ref="rowMenuRef">
                  <base-button @click="rowMenuRef[index].toggle()">
                    <base-icon class="text-md!" icon="i-fa7-solid:ellipsis-vertical" />
                  </base-button>
                  <template #content>
                    <base-card class="p-0! gap-0! -mt-2" shadow>
                      <div class="flex flex-col">
                        <router-link :to="`/dividend-stocks/${dividendStock._id}`">
                          <base-button variant="text" color="info" class="w-full py-1! px-3! m-0! flex gap-2! items-center justify-start text-left!">
                            <base-icon icon="i-fa7-light-book-open-cover" />
                            <p class="flex-1">View</p>
                          </base-button>
                        </router-link>
                        <base-divider orientation="vertical" class="my-0!" />
                        <router-link v-if="authStore.hasPermission('dividend-stocks:update')" :to="`/dividend-stocks/${dividendStock._id}/edit`">
                          <base-button variant="text" color="info" class="w-full py-1! px-3! m-0! flex gap-2! items-center justify-start text-left!">
                            <base-icon icon="i-fa7-light-file-pen" />
                            <p class="flex-1">Edit</p>
                          </base-button>
                        </router-link>
                        <base-divider orientation="vertical" class="my-0!" />
                        <base-button v-if="authStore.hasPermission('dividend-stocks:delete')" @click="onDeleteModal(dividendStock, index)" variant="text" color="danger" class="w-full py-1! px-3! m-0! flex gap-2! items-center justify-start text-left!">
                          <base-icon icon="i-fa7-light-trash-xmark" />
                          <p class="flex-1">Delete</p>
                        </base-button>
                      </div>
                    </base-card>
                  </template>
                </base-popover>
              </td>

              <!-- Dividend Stock fields rendered conditionally based on column visibility -->
              <td v-if="columns['status']?.isVisible">
                <base-badge v-if="dividendStock.status === 'draft'" variant="filled" color="danger" class="font-bold w-32 uppercase">
                  <base-icon icon="i-fa7-solid:box-open" /> Draft
                </base-badge>
                <base-badge v-else-if="dividendStock.status === 'active'" variant="filled" color="info" class="font-bold w-32 uppercase">
                  <base-icon icon="i-fa7-solid:box-dollar" /> Active
                </base-badge>
              </td>
              <td v-if="columns['form_number']?.isVisible">
                <router-link :to="`/dividend-stocks/${dividendStock._id}`" class="text-blue">{{ dividendStock.form_number }}</router-link>
              </td>
              <td v-if="columns['dividend_date']?.isVisible">{{ dividendStock.dividend_date }}</td>
              <td v-if="columns['broker.name']?.isVisible">{{ dividendStock.broker?.name }}</td>
              <td v-if="columns['bank.account.account_name']?.isVisible">{{ dividendStock.bank?.account.account_name }}</td>
              <td v-if="columns['bank.account.account_number']?.isVisible">{{ dividendStock.bank?.account.account_number }}</td>
              <td v-if="columns['transactions.owner.name']?.isVisible">{{ dividendStock.transactions?.[0]?.owner?.name }}</td>
              <td v-if="columns['total_received']?.isVisible">{{ formatNumber(dividendStock.total_received, 2) }}</td>
              <td v-if="columns['notes']?.isVisible">{{ dividendStock.notes }}</td>
              <td v-if="columns['is_archived']?.isVisible">
                <base-badge v-if="dividendStock.is_archived" variant="filled" color="danger" class="font-bold">
                  <base-icon icon="i-fa7-solid:box-archive" /> ARCHIVED
                </base-badge>
              </td>
            </tr>
          </template>
        </tbody>
      </base-table>

      <!-- Pagination component with two-way binding to pagination.page -->
      <base-pagination
        v-if="!isLoading"
        v-model="pagination.page"
        :page-size="pagination.page_size"
        :total-document="pagination.total_document"
        @update:model-value="onPageUpdate()"
      />
    </div>

    <!-- Delete confirmation modal -->
    <modal-delete ref="deleteModalRef" @deleted="onDeleted" />
  </base-card>

  <!-- Table Setting modal -->
  <table-setting-modal
    :is-open="isOpen"
    :columns="columns"
    :page-size="pageSize"
    :page-size-options="pageSizeOptions"
    @update:close="close"
    @update:pageSize="val => { pageSize = val }"
  />
</template>

<style scoped lang="postcss"></style>
