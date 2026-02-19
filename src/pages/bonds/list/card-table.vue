<script setup lang="ts">
import { watchDebounced } from '@vueuse/core';
import { onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import BaseDateRangePicker from '@/components/base-date-range-picker.vue';
import TableSettingModal from '@/components/table-setting-modal.vue';
import { getBondsApi, type IBondData } from '@/composables/api/bonds/get.api';
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
    'type': { label: 'Type of Bond', isVisible: true, isSelectable: true },
    form_number: { label: 'Form Number', isVisible: true, isSelectable: true },
    'product': { label: 'Product', isVisible: true, isSelectable: true },
    'series': { label: 'Series', isVisible: true, isSelectable: true },
    'year_issued': { label: 'Year Issued', isVisible: true, isSelectable: true },
    'coupon_rate': { label: 'Coupon Rate', isVisible: true, isSelectable: true },
    'bank_source.account.account_number': { label: 'Source of Fund - Account Number', isVisible: true, isSelectable: true },
    'bank_source.account.account_name': { label: 'Source of Fund - Account Name', isVisible: true, isSelectable: true },
    'bank_placement.name': { label: 'Bank', isVisible: true, isSelectable: true },
    'bank_placement.account.account_number': { label: 'Bank - Account Number', isVisible: true, isSelectable: true },
    'bank_placement.account.account_name': { label: 'Bank - Account Name', isVisible: true, isSelectable: true },
    'owner.name': { label: 'Owner', isVisible: true, isSelectable: true },
    'base_date': { label: 'Base Date', isVisible: true, isSelectable: true },
    'transaction_date': { label: 'Transaction Date', isVisible: true, isSelectable: true },
    'settlement_date': { label: 'Settlement Date', isVisible: true, isSelectable: true },
    'maturity_date': { label: 'Maturity Date', isVisible: true, isSelectable: true },
    'transaction_number': { label: 'Transaction Number', isVisible: true, isSelectable: true },
    'price': { label: 'Price', isVisible: true, isSelectable: true },
    'principal_amount': { label: 'Principal Amount', isVisible: true, isSelectable: true },
    'remaining_amount': { label: 'Remaining Amount', isVisible: true, isSelectable: true },
    'proceed_amount': { label: 'Proceed', isVisible: true, isSelectable: true },
    'accrued_interest': { label: 'Accrued Interest', isVisible: true, isSelectable: true },
    'total_proceed': { label: 'Total Proceed', isVisible: true, isSelectable: true },
    'coupon_tenor': { label: 'Coupon Tenor', isVisible: true, isSelectable: true },
    'coupon_gross_amount': { label: 'Gross Coupon', isVisible: true, isSelectable: true },
    'coupon_tax_rate': { label: 'Tax Rate', isVisible: true, isSelectable: true },
    'coupon_tax_amount': { label: 'Amount of Tax', isVisible: true, isSelectable: true },
    'coupon_net_amount': { label: 'Coupon Net', isVisible: true, isSelectable: true },
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
    'type': '',
    form_number: '',
    'product': '',
    'series': '',
    'year_issued': '',
    'coupon_rate': '',
    'bank_source.account.account_number': '',
    'bank_source.account.account_name': '',
    'bank_placement.name': '',
    'bank_placement.account.account_number': '',
    'bank_placement.account.account_name': '',
    'owner.name': '',
    'base_date': '',
    'transaction_date': '',
    'settlement_date': '',
    'maturity_date': '',
    'transaction_number': '',
    'price': '',
    'principal_amount': '',
    'remaining_amount': '',
    'proceed_amount': '',
    'accrued_interest': '',
    'total_proceed': '',
    'coupon_tenor': '',
    'coupon_gross_amount': '',
    'coupon_tax_rate': '',
    'coupon_tax_amount': '',
    'coupon_net_amount': '',
    notes: '',
    is_archived: 'false',
  },
  initialSortKeys: {
    status: 0,
    'type': 0,
    form_number: 0,
    'product': 0,
    'series': 0,
    'year_issued': 0,
    'coupon_rate': 0,
    'bank_source.account.account_number': 0,
    'bank_source.account.account_name': 0,
    'bank_placement.name': 0,
    'bank_placement.account.account_number': 0,
    'bank_placement.account.account_name': 0,
    'owner.name': 0,
    'base_date': 0,
    'transaction_date': 0,
    'settlement_date': 0,
    'maturity_date': 0,
    'transaction_number': 0,
    'price': 0,
    'principal_amount': 0,
    'remaining_amount': 0,
    'proceed_amount': 0,
    'accrued_interest': 0,
    'total_proceed': 0,
    'coupon_tenor': 0,
    'coupon_gross_amount': 0,
    'coupon_tax_rate': 0,
    'coupon_tax_amount': 0,
    'coupon_net_amount': 0,
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
 * - bonds data retrieved from API
 * - loading state
 * - control flags to prevent unnecessary watcher triggers
 */
const bonds = ref<IBondData[]>();
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
    await getBonds(pagination.page);
    await updateQueryParams({ 'page': pagination.page.toString() });
  }
};

/**
 * Reset pagination to first page and fetch data accordingly.
 */
const resetPageAndFetch = async () => {
  pagination.page = 1;
  await updateQueryParams({ page: 1 });
  await getBonds();
};

/**
 * Fetch data from API based on current filters, sorting, and pagination.
 * Manages loading state and error handling with user notifications.
 * @param page - Current page number to fetch (default 1)
 */
const getBonds = async (page = 1) => {
  try {
    isLoading.value = true;
    const response = await getBondsApi({
      search: filter,
      sort: sortObjectToString(sort),
      page,
      page_size: pagination.page_size,
    });
    bonds.value = response.data;
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
  await getBonds();

  setTimeout(() => { isInitialSetup.value = false; }, 1000);
};

/**
 * Opens the delete confirmation modal for a specific bond.
 * Also closes the row menu popover.
 * @param bond - The data row to delete
 * @param index - Index of the row for UI references
 */
const onDeleteModal = (bond: IBondData, index: number) => {
  rowMenuRef.value[index].toggle(false);
  deleteModalRef.value.toggleModal({
    _id: bond._id,
    label: `${bond.form_number}`,
  });
};

/**
 * Handler called after a successful deletion.
 * Refreshes the data list.
 */
const onDeleted = async () => {
  await getBonds();
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
  await getBonds(pagination.page);

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
  <base-card title="Bonds">
    <div class="flex flex-col lg:flex-row gap-2 items-center justify-between mb-8">
      <div class="flex-1 w-full">
        <base-input v-model="filter.all" placeholder="Search..." border="full" :readonly="isLoading">
          <template #prefix>
            <base-icon icon="i-fa7-solid-magnifying-glass" />
          </template>
        </base-input>
      </div>
      <div class="flex gap-1">
        <router-link v-if="authStore.hasPermission('bonds:create')" to="/bonds/create">
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
            <th v-if="columns['type']?.isVisible">
              <base-input v-model="filter.type" placeholder="Search..." :readonly="isLoading" border="none" paddingless />
            </th>
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
            <th v-if="columns['product']?.isVisible">
              <base-input v-model="filter['product']" placeholder="Search..." :readonly="isLoading" border="none" paddingless />
            </th>
            <th v-if="columns['series']?.isVisible">
              <base-input v-model="filter['series']" placeholder="Search..." :readonly="isLoading" border="none" paddingless />
            </th>
            <th v-if="columns['year_issued']?.isVisible">
              <base-input v-model="filter['year_issued']" placeholder="Search..." :readonly="isLoading" border="none" paddingless />
            </th>
            <th v-if="columns['coupon_rate']?.isVisible">
              <base-input v-model="filter['coupon_rate']" placeholder="Search..." :readonly="isLoading" border="none" paddingless />
            </th>
            <th v-if="columns['bank_source.account.account_number']?.isVisible">
              <base-input v-model="filter['bank_source.account.account_number']" placeholder="Search..." :readonly="isLoading" border="none" paddingless />
            </th>
            <th v-if="columns['bank_source.account.account_name']?.isVisible">
              <base-input v-model="filter['bank_source.account.account_name']" placeholder="Search..." :readonly="isLoading" border="none" paddingless />
            </th>
            <th v-if="columns['bank_placement.name']?.isVisible">
              <base-input v-model="filter['bank_placement.name']" placeholder="Search..." :readonly="isLoading" border="none" paddingless />
            </th>
            <th v-if="columns['bank_placement.account.account_number']?.isVisible">
              <base-input v-model="filter['bank_placement.account.account_number']" placeholder="Search..." :readonly="isLoading" border="none" paddingless />
            </th>
            <th v-if="columns['bank_placement.account.account_name']?.isVisible">
              <base-input v-model="filter['bank_placement.account.account_name']" placeholder="Search..." :readonly="isLoading" border="none" paddingless />
            </th>
            <th v-if="columns['owner.name']?.isVisible">
              <base-input v-model="filter['owner.name']" placeholder="Search..." :readonly="isLoading" border="none" paddingless />
            </th>
            <th v-if="columns['base_date']?.isVisible">
              <base-input v-model="filter['base_date']" placeholder="Search..." :readonly="isLoading" border="none" paddingless />
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
            <th v-if="columns['maturity_date']?.isVisible">
              <base-date-range-picker
                v-model:date_from="filter['maturity_date_from']"
                v-model:date_to="filter['maturity_date_to']"
                placeholder="Search..."
                :readonly="isLoading"
                border="none"
                paddingless
              />
            </th>
            <th v-if="columns['transaction_number']?.isVisible">
              <base-input v-model="filter['transaction_number']" placeholder="Search..." :readonly="isLoading" border="none" paddingless />
            </th>
            <th v-if="columns['buying_brokerage_fee']?.isVisible">
              <base-input v-model="filter['buying_brokerage_fee']" placeholder="Search..." :readonly="isLoading" border="none" paddingless />
            </th>
            <th v-if="columns['price']?.isVisible">
              <base-input v-model="filter['price']" placeholder="Search..." :readonly="isLoading" border="none" paddingless />
            </th>
            <th v-if="columns['principal_amount']?.isVisible">
              <base-input v-model="filter['principal_amount']" placeholder="Search..." :readonly="isLoading" border="none" paddingless />
            </th>
            <th v-if="columns['remaining_amount']?.isVisible">
              <base-input v-model="filter['remaining_amount']" placeholder="Search..." :readonly="isLoading" border="none" paddingless />
            </th>
            <th v-if="columns['proceed_amount']?.isVisible">
              <base-input v-model="filter['proceed_amount']" placeholder="Search..." :readonly="isLoading" border="none" paddingless />
            </th>
            <th v-if="columns['accrued_interest']?.isVisible">
              <base-input v-model="filter['accrued_interest']" placeholder="Search..." :readonly="isLoading" border="none" paddingless />
            </th>
            <th v-if="columns['total_proceed']?.isVisible">
              <base-input v-model="filter['total_proceed']" placeholder="Search..." :readonly="isLoading" border="none" paddingless />
            </th>
            <th v-if="columns['coupon_tenor']?.isVisible">
              <base-input v-model="filter['coupon_tenor']" placeholder="Search..." :readonly="isLoading" border="none" paddingless />
            </th>
            <th v-if="columns['coupon_gross_amount']?.isVisible">
              <base-input v-model="filter['coupon_gross_amount']" placeholder="Search..." :readonly="isLoading" border="none" paddingless />
            </th>
            <th v-if="columns['coupon_tax_rate']?.isVisible">
              <base-input v-model="filter['coupon_tax_rate']" placeholder="Search..." :readonly="isLoading" border="none" paddingless />
            </th>
            <th v-if="columns['coupon_tax_amount']?.isVisible">
              <base-input v-model="filter['coupon_tax_amount']" placeholder="Search..." :readonly="isLoading" border="none" paddingless />
            </th>
            <th v-if="columns['coupon_net_amount']?.isVisible">
              <base-input v-model="filter['coupon_net_amount']" placeholder="Search..." :readonly="isLoading" border="none" paddingless />
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

          <!-- Show no data found message if no bonds and query params exist -->
          <tr v-if="!isLoading && bonds?.length === 0 && route.query">
            <td :colspan="countVisibleColumns + 1">
              <div class="w-full flex-col p-10 items-center justify-center gap-2">
                <p class="text-xl">Data Not Found</p>
                <base-button @click="onResetFilter" variant="filled" color="primary" class="my-2 px-4!">
                  Reset Filter
                </base-button>
              </div>
            </td>
          </tr>

          <!-- Render rows of bond data when available -->
          <template v-if="!isLoading && bonds && bonds.length > 0">
            <tr v-for="(bond, index) in bonds" :key="index" :class="{'bg-red-50 dark:bg-red-800': bond.status === 'draft'}">
              <td>
                <!-- Row action menu -->
                <base-popover placement="bottom" ref="rowMenuRef">
                  <base-button @click="rowMenuRef[index].toggle()">
                    <base-icon class="text-md!" icon="i-fa7-solid:ellipsis-vertical" />
                  </base-button>
                  <template #content>
                    <base-card class="p-0! gap-0! -mt-2" shadow>
                      <div class="flex flex-col">
                        <router-link :to="`/bonds/${bond._id}`">
                          <base-button variant="text" color="info" class="w-full py-1! px-3! m-0! flex gap-2! items-center justify-start text-left!">
                            <base-icon icon="i-fa7-light-book-open-cover" />
                            <p class="flex-1">View</p>
                          </base-button>
                        </router-link>
                        <base-divider orientation="vertical" class="my-0!" />
                        <router-link v-if="authStore.hasPermission('bonds:update')" :to="`/bonds/${bond._id}/edit`">
                          <base-button variant="text" color="info" class="w-full py-1! px-3! m-0! flex gap-2! items-center justify-start text-left!">
                            <base-icon icon="i-fa7-light-file-pen" />
                            <p class="flex-1">Edit</p>
                          </base-button>
                        </router-link>
                        <base-divider orientation="vertical" class="my-0!" />
                        <base-button v-if="authStore.hasPermission('bonds:delete')" @click="onDeleteModal(bond, index)" variant="text" color="danger" class="w-full py-1! px-3! m-0! flex gap-2! items-center justify-start text-left!">
                          <base-icon icon="i-fa7-light-trash-xmark" />
                          <p class="flex-1">Delete</p>
                        </base-button>
                      </div>
                    </base-card>
                  </template>
                </base-popover>
              </td>

              <!-- Bond fields rendered conditionally based on column visibility -->
              <td v-if="columns['status']?.isVisible">
                <base-badge v-if="bond.status === 'draft'" variant="filled" color="danger" class="font-bold w-32 uppercase">
                  <base-icon icon="i-fa7-solid:box-open" /> Draft
                </base-badge>
                <base-badge v-else-if="bond.status === 'active'" variant="filled" color="info" class="font-bold w-32 uppercase">
                  <base-icon icon="i-fa7-solid:box-dollar" /> Active
                </base-badge>
                <base-badge v-else-if="bond.status === 'completed'" variant="filled" color="success" class="font-bold w-32 uppercase">
                  <base-icon icon="i-fa7-solid:box-check" /> Completed
                </base-badge>
              </td>
              <td v-if="columns['type']?.isVisible">{{ bond.type }}</td>
              <td v-if="columns['form_number']?.isVisible">
                <router-link :to="`/bonds/${bond._id}`" class="text-blue">{{ bond.form_number }}</router-link>
              </td>
              <td v-if="columns['product']?.isVisible">{{ bond.product }}</td>
              <td v-if="columns['series']?.isVisible">{{ bond.series }}</td>
              <td v-if="columns['year_issued']?.isVisible">{{ bond.product }}</td>
              <td v-if="columns['coupon_rate']?.isVisible">{{ bond.coupon_rate }}</td>
              <td v-if="columns['bank_source.account.account_number']?.isVisible">{{ bond.bank_source?.account?.account_number }}</td>
              <td v-if="columns['bank_source.account.account_name']?.isVisible">{{ bond.bank_source?.account?.account_name }}</td>
              <td v-if="columns['bank_placement.name']?.isVisible">{{ bond.bank_placement?.name }}</td>
              <td v-if="columns['bank_placement.account.account_number']?.isVisible">{{ bond.bank_placement?.account?.account_number }}</td>
              <td v-if="columns['bank_placement.account.account_name']?.isVisible">{{ bond.bank_placement?.account?.account_name }}</td>
              <td v-if="columns['owner.name']?.isVisible">{{ bond.owner?.name }}</td>
              <td v-if="columns['base_date']?.isVisible">{{ bond.base_date }}</td>
              <td v-if="columns['transaction_date']?.isVisible">{{ bond.transaction_date }}</td>
              <td v-if="columns['settlement_date']?.isVisible">{{ bond.settlement_date }}</td>
              <td v-if="columns['maturity_date']?.isVisible">{{ bond.maturity_date }}</td>
              <td v-if="columns['transaction_number']?.isVisible">{{ formatNumber(bond.transaction_number, 2) }}</td>
              <td v-if="columns['price']?.isVisible">{{ formatNumber(bond.price, 2) }}</td>
              <td v-if="columns['principal_amount']?.isVisible">{{ formatNumber(bond.principal_amount, 2) }}</td>
              <td v-if="columns['remaining_amount']?.isVisible">{{ formatNumber(bond.remaining_amount, 2) }}</td>
              <td v-if="columns['proceed_amount']?.isVisible">{{ formatNumber(bond.proceed_amount, 2) }}</td>
              <td v-if="columns['accrued_interest']?.isVisible">{{ formatNumber(bond.accrued_interest, 2) }}</td>
              <td v-if="columns['total_proceed']?.isVisible">{{ formatNumber(bond.total_proceed, 2) }}</td>
              <td v-if="columns['coupon_tenor']?.isVisible">{{ formatNumber(bond.coupon_tenor, 2) }}</td>
              <td v-if="columns['coupon_gross_amount']?.isVisible">{{ formatNumber(bond.coupon_gross_amount, 2) }}</td>
              <td v-if="columns['coupon_tax_rate']?.isVisible">{{ formatNumber(bond.coupon_tax_rate, 2) }}</td>
              <td v-if="columns['coupon_tax_amount']?.isVisible">{{ formatNumber(bond.coupon_tax_amount, 2) }}</td>
              <td v-if="columns['coupon_net_amount']?.isVisible">{{ formatNumber(bond.coupon_net_amount, 2) }}</td>

              <td v-if="columns['notes']?.isVisible">{{ bond.notes }}</td>
              <td v-if="columns['is_archived']?.isVisible">
                <base-badge v-if="bond.is_archived" variant="filled" color="danger" class="font-bold">
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
