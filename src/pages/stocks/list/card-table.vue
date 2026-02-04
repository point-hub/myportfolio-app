<script setup lang="ts">
import { watchDebounced } from '@vueuse/core';
import { onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import BaseDateRangePicker from '@/components/base-date-range-picker.vue';
import TableSettingModal from '@/components/table-setting-modal.vue';
import { getStocksApi, type IStockData } from '@/composables/api/stocks/get.api';
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
    'transaction_number': { label: 'Transaction Number', isVisible: true, isSelectable: true },
    'owner.name': { label: 'Owner', isVisible: true, isSelectable: true },
    'broker.name': { label: 'Broker', isVisible: true, isSelectable: true },
    'transaction_date': { label: 'Transaction Date', isVisible: true, isSelectable: true },
    'settlement_date': { label: 'Settlement Date', isVisible: true, isSelectable: true },
    'buying_total': { label: 'Buying Total Trade', isVisible: true, isSelectable: true },
    'buying_brokerage_fee': { label: 'Buying Brokerage Fee', isVisible: true, isSelectable: true },
    'buying_vat': { label: 'Buying VAT', isVisible: true, isSelectable: true },
    'buying_levy': { label: 'Buying Levy', isVisible: true, isSelectable: true },
    'buying_kpei': { label: 'Buying KPEI', isVisible: true, isSelectable: true },
    'buying_stamp': { label: 'Buying Stamp', isVisible: true, isSelectable: true },
    'buying_proceed': { label: 'Buying Proceed Amount', isVisible: true, isSelectable: true },
    'selling_total': { label: 'Selling Total Trade', isVisible: true, isSelectable: true },
    'selling_brokerage_fee': { label: 'Selling Brokerage Fee', isVisible: true, isSelectable: true },
    'selling_vat': { label: 'Selling VAT', isVisible: true, isSelectable: true },
    'selling_levy': { label: 'Selling Levy', isVisible: true, isSelectable: true },
    'selling_kpei': { label: 'Selling KPEI', isVisible: true, isSelectable: true },
    'selling_stamp': { label: 'Selling Stamp', isVisible: true, isSelectable: true },
    'selling_proceed': { label: 'Selling Proceed Amount', isVisible: true, isSelectable: true },
    'proceed_amount': { label: 'Proceed Amount', isVisible: true, isSelectable: true },
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
    'owner.name': '',
    'broker.name': '',
    'transaction_number': '',
    'transaction_date': '',
    'transaction_date_from': '',
    'transaction_date_to': '',
    'settlement_date': '',
    'settlement_date_from': '',
    'settlement_date_to': '',
    'buying_total': '',
    'buying_brokerage_fee': '',
    'buying_vat': '',
    'buying_levy': '',
    'buying_kpei': '',
    'buying_stamp': '',
    'buying_proceed': '',
    'selling_total': '',
    'selling_brokerage_fee': '',
    'selling_vat': '',
    'selling_levy': '',
    'selling_kpei': '',
    'selling_stamp': '',
    'selling_proceed': '',
    'proceed_amount': '',
    notes: '',
    is_archived: 'false',
  },
  initialSortKeys: {
    status: 0,
    form_number: 0,
    'owner.name': 0,
    'broker.name': 0,
    'transaction_number': 0,
    'transaction_date': 0,
    'settlement_date': 0,
    'buying_total': 0,
    'buying_brokerage_fee': 0,
    'buying_vat': 0,
    'buying_levy': 0,
    'buying_kpei': 0,
    'buying_stamp': 0,
    'buying_proceed': 0,
    'selling_total': 0,
    'selling_brokerage_fee': 0,
    'selling_vat': 0,
    'selling_levy': 0,
    'selling_kpei': 0,
    'selling_stamp': 0,
    'selling_proceed': 0,
    'proceed_amount': 0,
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
 * - stocks data retrieved from API
 * - loading state
 * - control flags to prevent unnecessary watcher triggers
 */
const stocks = ref<IStockData[]>();
const isInitialSetup = ref(true);
const isLoading = ref(false);
const archivedOptions = ref([{ label: 'Yes', value: 'true' }, { label: 'No', value: 'false' }]);
const statusOptions = ref([
  { label: 'Draft', value: 'draft' },
  { label: 'Active', value: 'active' },
  { label: 'Paid', value: 'paid' },
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
    await getStocks(pagination.page);
    await updateQueryParams({ 'page': pagination.page.toString() });
  }
};

/**
 * Reset pagination to first page and fetch data accordingly.
 */
const resetPageAndFetch = async () => {
  pagination.page = 1;
  await updateQueryParams({ page: 1 });
  await getStocks();
};

/**
 * Fetch data from API based on current filters, sorting, and pagination.
 * Manages loading state and error handling with user notifications.
 * @param page - Current page number to fetch (default 1)
 */
const getStocks = async (page = 1) => {
  try {
    isLoading.value = true;
    const response = await getStocksApi({
      search: filter,
      sort: sortObjectToString(sort),
      page,
      page_size: pagination.page_size,
    });
    stocks.value = response.data;
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
  await getStocks();

  setTimeout(() => { isInitialSetup.value = false; }, 1000);
};

/**
 * Opens the delete confirmation modal for a specific stock.
 * Also closes the row menu popover.
 * @param stock - The data row to delete
 * @param index - Index of the row for UI references
 */
const onDeleteModal = (stock: IStockData, index: number) => {
  rowMenuRef.value[index].toggle(false);
  deleteModalRef.value.toggleModal({
    _id: stock._id,
    label: `${stock.form_number}`,
  });
};

/**
 * Handler called after a successful deletion.
 * Refreshes the data list.
 */
const onDeleted = async () => {
  await getStocks();
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
  await getStocks(pagination.page);

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
  <base-card title="Stocks">
    <div class="flex flex-col lg:flex-row gap-2 items-center justify-between mb-8">
      <div class="flex-1 w-full">
        <base-input v-model="filter.all" placeholder="Search..." border="full" :readonly="isLoading">
          <template #prefix>
            <base-icon icon="i-fa7-solid-magnifying-glass" />
          </template>
        </base-input>
      </div>
      <div class="flex gap-1">
        <router-link v-if="authStore.hasPermission('stocks:create')" to="/stocks/create">
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
            <th v-if="columns['transaction_number']?.isVisible">
              <base-input v-model="filter['transaction_number']" placeholder="Search..." :readonly="isLoading" border="none" paddingless />
            </th>
            <th v-if="columns['owner.name']?.isVisible">
              <base-input v-model="filter['owner.name']" placeholder="Search..." :readonly="isLoading" border="none" paddingless />
            </th>
            <th v-if="columns['broker.name']?.isVisible">
              <base-input v-model="filter['broker.name']" placeholder="Search..." :readonly="isLoading" border="none" paddingless />
            </th>
            <th v-if="columns['transaction_date']?.isVisible">
              <base-date-range-picker
                v-model:date_from="filter['transaction_date_from']"
                v-model:date_to="filter['transaction_date_to']"
                placeholder="Search..."
                :readonly="isLoading"
                border="none"
                paddingless
              />
            </th>
            <th v-if="columns['settlement_date']?.isVisible">
              <base-date-range-picker
                v-model:date_from="filter['settlement_date_from']"
                v-model:date_to="filter['settlement_date_to']"
                placeholder="Search..."
                :readonly="isLoading"
                border="none"
                paddingless
              />
            </th>
            <th v-if="columns['buying_total']?.isVisible">
              <base-input v-model="filter['buying_total']" placeholder="Search..." :readonly="isLoading" border="none" paddingless />
            </th>
            <th v-if="columns['buying_brokerage_fee']?.isVisible">
              <base-input v-model="filter['buying_brokerage_fee']" placeholder="Search..." :readonly="isLoading" border="none" paddingless />
            </th>
            <th v-if="columns['buying_vat']?.isVisible">
              <base-input v-model="filter['buying_vat']" placeholder="Search..." :readonly="isLoading" border="none" paddingless />
            </th>
            <th v-if="columns['buying_levy']?.isVisible">
              <base-input v-model="filter['buying_levy']" placeholder="Search..." :readonly="isLoading" border="none" paddingless />
            </th>
            <th v-if="columns['buying_kpei']?.isVisible">
              <base-input v-model="filter['buying_kpei']" placeholder="Search..." :readonly="isLoading" border="none" paddingless />
            </th>
            <th v-if="columns['buying_stamp']?.isVisible">
              <base-input v-model="filter['buying_stamp']" placeholder="Search..." :readonly="isLoading" border="none" paddingless />
            </th>
            <th v-if="columns['buying_proceed']?.isVisible">
              <base-input v-model="filter['buying_proceed']" placeholder="Search..." :readonly="isLoading" border="none" paddingless />
            </th>
            <th v-if="columns['selling_total']?.isVisible">
              <base-input v-model="filter['selling_total']" placeholder="Search..." :readonly="isLoading" border="none" paddingless />
            </th>
            <th v-if="columns['selling_brokerage_fee']?.isVisible">
              <base-input v-model="filter['selling_brokerage_fee']" placeholder="Search..." :readonly="isLoading" border="none" paddingless />
            </th>
            <th v-if="columns['selling_vat']?.isVisible">
              <base-input v-model="filter['selling_vat']" placeholder="Search..." :readonly="isLoading" border="none" paddingless />
            </th>
            <th v-if="columns['selling_levy']?.isVisible">
              <base-input v-model="filter['selling_levy']" placeholder="Search..." :readonly="isLoading" border="none" paddingless />
            </th>
            <th v-if="columns['selling_kpei']?.isVisible">
              <base-input v-model="filter['selling_kpei']" placeholder="Search..." :readonly="isLoading" border="none" paddingless />
            </th>
            <th v-if="columns['selling_stamp']?.isVisible">
              <base-input v-model="filter['selling_stamp']" placeholder="Search..." :readonly="isLoading" border="none" paddingless />
            </th>
            <th v-if="columns['selling_proceed']?.isVisible">
              <base-input v-model="filter['selling_proceed']" placeholder="Search..." :readonly="isLoading" border="none" paddingless />
            </th>
            <th v-if="columns['proceed_amount']?.isVisible">
              <base-input v-model="filter['proceed_amount']" placeholder="Search..." :readonly="isLoading" border="none" paddingless />
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

          <!-- Show no data found message if no stocks and query params exist -->
          <tr v-if="!isLoading && stocks?.length === 0 && route.query">
            <td :colspan="countVisibleColumns + 1">
              <div class="w-full flex-col p-10 items-center justify-center gap-2">
                <p class="text-xl">Data Not Found</p>
                <base-button @click="onResetFilter" variant="filled" color="primary" class="my-2 px-4!">
                  Reset Filter
                </base-button>
              </div>
            </td>
          </tr>

          <!-- Render rows of stock data when available -->
          <template v-if="!isLoading && stocks && stocks.length > 0">
            <tr v-for="(stock, index) in stocks" :key="index" :class="{'bg-red-50 dark:bg-red-800': stock.status === 'draft'}">
              <td>
                <!-- Row action menu -->
                <base-popover placement="bottom" ref="rowMenuRef">
                  <base-button @click="rowMenuRef[index].toggle()">
                    <base-icon class="text-md!" icon="i-fa7-solid:ellipsis-vertical" />
                  </base-button>
                  <template #content>
                    <base-card class="p-0! gap-0! -mt-2" shadow>
                      <div class="flex flex-col">
                        <router-link :to="`/stocks/${stock._id}`">
                          <base-button variant="text" color="info" class="w-full py-1! px-3! m-0! flex gap-2! items-center justify-start text-left!">
                            <base-icon icon="i-fa7-light-book-open-cover" />
                            <p class="flex-1">View</p>
                          </base-button>
                        </router-link>
                        <base-divider orientation="vertical" class="my-0!" />
                        <router-link v-if="authStore.hasPermission('stocks:update')" :to="`/stocks/${stock._id}/edit`">
                          <base-button variant="text" color="info" class="w-full py-1! px-3! m-0! flex gap-2! items-center justify-start text-left!">
                            <base-icon icon="i-fa7-light-file-pen" />
                            <p class="flex-1">Edit</p>
                          </base-button>
                        </router-link>
                        <base-divider orientation="vertical" class="my-0!" />
                        <base-button v-if="authStore.hasPermission('stocks:delete')" @click="onDeleteModal(stock, index)" variant="text" color="danger" class="w-full py-1! px-3! m-0! flex gap-2! items-center justify-start text-left!">
                          <base-icon icon="i-fa7-light-trash-xmark" />
                          <p class="flex-1">Delete</p>
                        </base-button>
                      </div>
                    </base-card>
                  </template>
                </base-popover>
              </td>

              <!-- Stock fields rendered conditionally based on column visibility -->
              <td v-if="columns['status']?.isVisible">
                <base-badge v-if="stock.status === 'draft'" variant="filled" color="danger" class="font-bold w-32 uppercase">
                  <base-icon icon="i-fa7-solid:box-open" /> Draft
                </base-badge>
                <base-badge v-else-if="stock.status === 'active'" variant="filled" color="info" class="font-bold w-32 uppercase">
                  <base-icon icon="i-fa7-solid:box-dollar" /> Active
                </base-badge>
                <base-badge v-else-if="stock.status === 'paid'" variant="filled" color="success" class="font-bold w-32 uppercase">
                  <base-icon icon="i-fa7-solid:box-check" /> Paid
                </base-badge>
              </td>
              <td v-if="columns['form_number']?.isVisible">
                <router-link :to="`/stocks/${stock._id}`" class="text-blue">{{ stock.form_number }}</router-link>
              </td>
              <td v-if="columns['transaction_number']?.isVisible">{{ stock.transaction_number }}</td>
              <td v-if="columns['owner.name']?.isVisible">
                <router-link :to="`/master/owners/${stock.owner?._id}`" class="text-blue">{{ stock.owner?.name }}</router-link>
              </td>
              <td v-if="columns['broker.name']?.isVisible">
                <router-link :to="`/master/owners/${stock.broker?._id}`" class="text-blue">{{ stock.broker?.name }}</router-link>
              </td>
              <td v-if="columns['transaction_date']?.isVisible">{{ stock.transaction_date }}</td>
              <td v-if="columns['settlement_date']?.isVisible">{{ stock.settlement_date }}</td>
              <td v-if="columns['buying_total']?.isVisible">{{ formatNumber(stock.buying_total, 2) }}</td>
              <td v-if="columns['buying_brokerage_fee']?.isVisible">{{ formatNumber(stock.buying_brokerage_fee, 2) }}</td>
              <td v-if="columns['buying_vat']?.isVisible">{{ formatNumber(stock.buying_vat, 2) }}</td>
              <td v-if="columns['buying_levy']?.isVisible">{{ formatNumber(stock.buying_levy, 2) }}</td>
              <td v-if="columns['buying_kpei']?.isVisible">{{ formatNumber(stock.buying_kpei, 2) }}</td>
              <td v-if="columns['buying_stamp']?.isVisible">{{ formatNumber(stock.buying_stamp, 2) }}</td>
              <td v-if="columns['buying_proceed']?.isVisible">{{ formatNumber(stock.buying_proceed, 2) }}</td>
              <td v-if="columns['selling_total']?.isVisible">{{ formatNumber(stock.selling_total, 2) }}</td>
              <td v-if="columns['selling_brokerage_fee']?.isVisible">{{ formatNumber(stock.selling_brokerage_fee, 2) }}</td>
              <td v-if="columns['selling_vat']?.isVisible">{{ formatNumber(stock.selling_vat, 2) }}</td>
              <td v-if="columns['selling_levy']?.isVisible">{{ formatNumber(stock.selling_levy, 2) }}</td>
              <td v-if="columns['selling_kpei']?.isVisible">{{ formatNumber(stock.selling_kpei, 2) }}</td>
              <td v-if="columns['selling_stamp']?.isVisible">{{ formatNumber(stock.selling_stamp, 2) }}</td>
              <td v-if="columns['selling_proceed']?.isVisible">{{ formatNumber(stock.selling_proceed, 2) }}</td>
              <td v-if="columns['proceed_amount']?.isVisible">{{ formatNumber(stock.proceed_amount, 2) }}</td>

              <td v-if="columns['notes']?.isVisible">{{ stock.notes }}</td>
              <td v-if="columns['is_archived']?.isVisible">
                <base-badge v-if="stock.is_archived" variant="filled" color="danger" class="font-bold">
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
