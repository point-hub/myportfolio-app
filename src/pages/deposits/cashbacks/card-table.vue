<script setup lang="ts">
import { watchDebounced } from '@vueuse/core';
import { onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import BaseDateRangePicker from '@/components/base-date-range-picker.vue';
import TableSettingModal from '@/components/table-setting-modal.vue';
import { getDepositCashbacksApi, type IDepositData } from '@/composables/api/deposits/get-cashbacks.api';
import { useQueryParams } from '@/composables/query-params';
import { useTableFilter } from '@/composables/table-filter';
import { useTableSetting } from '@/composables/table-setting';
import { useAuthStore } from '@/stores/auth.store';
import { toast } from '@/toast';
import { handleError } from '@/utils/api';
import { formatNumber, roundNumber } from '@/utils/number';

import ReceiveCashbackModal from '../components/receive-cashback-modal/index.vue';

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
    'status': { label: 'Status', isVisible: true, isSelectable: true },
    'cashback_schedule.status': { label: 'Payment Status', isVisible: true, isSelectable: true },
    'placement.bilyet_number': { label: 'Bilyet Number', isVisible: true, isSelectable: true },
    'cashback_schedule.payment_date': { label: 'Payment Date', isVisible: true, isSelectable: true },
    'cashback_schedule.received_date': { label: 'Received Date', isVisible: true, isSelectable: true },
    'cashback_schedule.received_additional_payment_date': { label: 'Received Additional Payment Date', isVisible: true, isSelectable: true },
    'cashback_schedule.amount': { label: 'Cashback Amount', isVisible: true, isSelectable: true },
    'cashback_schedule.received_amount': { label: 'Received Amount', isVisible: true, isSelectable: true },
    'cashback_schedule.received_additional_payment_amount': { label: 'Received Additional Payment Amount', isVisible: true, isSelectable: true },
    'cashback_schedule.remaining_amount': { label: 'Remaining Amount', isVisible: true, isSelectable: true },
    'cashback_schedule.bank.name': { label: 'Bank Name', isVisible: true, isSelectable: true },
    'cashback_schedule.bank.account.account_name': { label: 'Bank Account Name', isVisible: true, isSelectable: true },
    'cashback_schedule.bank.account.account_number': { label: 'Bank Account Number', isVisible: true, isSelectable: true },
    'cashback_schedule.additional_bank.name': { label: 'Additional Bank Name', isVisible: true, isSelectable: true },
    'cashback_schedule.additional_bank.account.account_name': { label: 'Additional Bank Account Name', isVisible: true, isSelectable: true },
    'cashback_schedule.additional_bank.account.account_number': { label: 'Additional Bank Account Number', isVisible: true, isSelectable: true },
    'cashback_schedule.created_by.username': { label: 'Created By', isVisible: true, isSelectable: true },
    form_number: { label: 'Form Number', isVisible: true, isSelectable: true },
    'owner.name': { label: 'Owner', isVisible: true, isSelectable: true },
    'placement.base_date': { label: 'Base Date', isVisible: true, isSelectable: true },
    'placement.date': { label: 'Placement Date', isVisible: true, isSelectable: true },
    'placement.term': { label: 'Term', isVisible: true, isSelectable: true },
    'placement.maturity_date': { label: 'Maturity Date', isVisible: true, isSelectable: true },
    'placement.amount': { label: 'Placement Amount', isVisible: true, isSelectable: true },
    'interest.payment_method': { label: 'Payment Method', isVisible: true, isSelectable: true },
    'interest.rate': { label: 'Interest Rate', isVisible: true, isSelectable: true },
    'interest.gross_amount': { label: 'Gross Amount', isVisible: true, isSelectable: true },
    'interest.tax_rate': { label: 'Tax Rate', isVisible: true, isSelectable: true },
    'interest.tax_amount': { label: 'Gross Amount', isVisible: true, isSelectable: true },
    'interest.net_amount': { label: 'Net Amount', isVisible: true, isSelectable: true },
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
    'cashback_schedule.status': '',
    'cashback_schedule.payment_date_from': '',
    'cashback_schedule.payment_date_to': '',
    'cashback_schedule.received_date_from': '',
    'cashback_schedule.received_date_to': '',
    'cashback_schedule.received_additional_payment_date_from': '',
    'cashback_schedule.received_additional_payment_date_to': '',
    'cashback_schedule.amount': '',
    'cashback_schedule.received_amount': '',
    'cashback_schedule.received_additional_payment_amount': '',
    'cashback_schedule.bank.name': '',
    'cashback_schedule.bank.account.account_name': '',
    'cashback_schedule.bank.account.account_number': '',
    'cashback_schedule.additional_bank.name': '',
    'cashback_schedule.additional_bank.account.account_name': '',
    'cashback_schedule.additional_bank.account.account_number': '',
    'placement.bilyet_number': '',
    'placement.base_date': '',
    'placement.date': '',
    'placement.date_from': '',
    'placement.date_to': '',
    'placement.term': '',
    'placement.maturity_date': '',
    'placement.maturity_date_from': '',
    'placement.maturity_date_to': '',
    'placement.amount': '',
    'interest.payment_method': '',
    'interest.rate': '',
    'interest.gross_amount': '',
    'interest.tax_rate': '',
    'interest.tax_amount': '',
    'interest.net_amount': '',
    notes: '',
    is_archived: 'false',
  },
  initialSortKeys: {
    status: 0,
    form_number: 0,
    'owner.name': 0,
    'cashback_schedule.status': 0,
    'cashback_schedule.payment_date': 0,
    'cashback_schedule.received_date': 0,
    'cashback_schedule.received_additional_payment_date': 0,
    'cashback_schedule.amount': 0,
    'cashback_schedule.received_amount': 0,
    'cashback_schedule.received_additional_payment_amount': 0,
    'cashback_schedule.bank.name': 0,
    'cashback_schedule.bank.account.account_name': 0,
    'cashback_schedule.bank.account.account_number': 0,
    'cashback_schedule.additional_bank.name': 0,
    'cashback_schedule.additional_bank.account.account_name': 0,
    'cashback_schedule.additional_bank.account.account_number': 0,
    'placement.bilyet_number': 0,
    'placement.base_date': 0,
    'placement.date': 0,
    'placement.term': 0,
    'placement.maturity_date': 0,
    'placement.amount': 0,
    'interest.payment_method': 0,
    'interest.rate': 0,
    'interest.gross_amount': 0,
    'interest.tax_rate': 0,
    'interest.tax_amount': 0,
    'interest.net_amount': 0,
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
 * - deposits data retrieved from API
 * - loading state
 * - control flags to prevent unnecessary watcher triggers
 */
const deposits = ref<IDepositData[]>();
const isInitialSetup = ref(true);
const isLoading = ref(false);
const archivedOptions = ref([{ label: 'Yes', value: 'true' }, { label: 'No', value: 'false' }]);
const receivedOptions = ref([{ label: 'Received', value: 'true' }, { label: 'Unpaid', value: 'false' }]);
const statusOptions = ref([
  { label: 'Draft', value: 'draft' },
  { label: 'Active', value: 'active' },
  { label: 'Completed', value: 'completed' },
]);

/**
 * References for dynamic UI components like row menus and delete modal.
 */
const rowMenuRef = ref();
const receiveCashbackModalRef = ref();

const onReceived = async () => {
  await getDeposits();
};

/**
 * Function triggered when pagination page changes.
 * Fetches new data for the updated page and updates query params.
 */
const onPageUpdate = async () => {
  if (!isInitialSetup.value) {
    await getDeposits(pagination.page);
    await updateQueryParams({ 'page': pagination.page.toString() });
  }
};

/**
 * Reset pagination to first page and fetch data accordingly.
 */
const resetPageAndFetch = async () => {
  pagination.page = 1;
  await updateQueryParams({ page: 1 });
  await getDeposits();
};

/**
 * Fetch data from API based on current filters, sorting, and pagination.
 * Manages loading state and error handling with user notifications.
 * @param page - Current page number to fetch (default 1)
 */
const getDeposits = async (page = 1) => {
  try {
    isLoading.value = true;
    const response = await getDepositCashbacksApi({
      search: filter,
      sort: sortObjectToString(sort),
      page,
      page_size: pagination.page_size,
    });
    deposits.value = response.data;
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
  await getDeposits();

  setTimeout(() => { isInitialSetup.value = false; }, 1000);
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
  await getDeposits(pagination.page);

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
  <receive-cashback-modal ref="receiveCashbackModalRef" @received="onReceived"></receive-cashback-modal>
  <base-card title="Deposits">
    <div class="flex flex-col lg:flex-row gap-2 items-center justify-between mb-8">
      <div class="flex-1 w-full">
        <base-input v-model="filter.all" placeholder="Search..." border="full" :readonly="isLoading">
          <template #prefix>
            <base-icon icon="i-fa7-solid-magnifying-glass" />
          </template>
        </base-input>
      </div>
      <div class="flex gap-1">
        <router-link v-if="authStore.hasPermission('deposits:create')" to="/deposits/create">
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
                v-model:selectedValue="filter.status"
                border="none"
                paddingless
              />
            </th>
            <th v-if="columns['cashback_schedule.status']?.isVisible">
              <base-choosen
                placeholder="Search..."
                title="Received Status"
                v-model:options="receivedOptions"
                v-model:selectedValue="filter['cashback_schedule.status']"
                border="none"
                paddingless
              />
            </th>
            <th v-if="columns['placement.bilyet_number']?.isVisible">
              <base-input v-model="filter['placement.bilyet_number']" placeholder="Search..." :readonly="isLoading" border="none" paddingless />
            </th>
            <th v-if="columns['cashback_schedule.payment_date']?.isVisible">
              <base-date-range-picker
                v-model:date_from="filter['cashback_schedule.payment_date_from']"
                v-model:date_to="filter['cashback_schedule.payment_date_to']"
                placeholder="Search..."
                :readonly="isLoading"
                border="none"
                paddingless
              />
            </th>
            <th v-if="columns['cashback_schedule.received_date']?.isVisible">
              <base-date-range-picker
                v-model:date_from="filter['cashback_schedule.received_date_from']"
                v-model:date_to="filter['cashback_schedule.received_date_to']"
                placeholder="Search..."
                :readonly="isLoading"
                border="none"
                paddingless
              />
            </th>
            <th v-if="columns['cashback_schedule.received_additional_payment_date']?.isVisible">
              <base-date-range-picker
                v-model:date_from="filter['cashback_schedule.received_additional_payment_date_from']"
                v-model:date_to="filter['cashback_schedule.received_additional_payment_date_to']"
                placeholder="Search..."
                :readonly="isLoading"
                border="none"
                paddingless
              />
            </th>
            <th v-if="columns['cashback_schedule.amount']?.isVisible">
              <base-input v-model="filter['cashback_schedule.amount']" placeholder="Search..." :readonly="isLoading" border="none" paddingless />
            </th>
            <th v-if="columns['cashback_schedule.received_amount']?.isVisible">
              <base-input v-model="filter['cashback_schedule.received_amount']" placeholder="Search..." :readonly="isLoading" border="none" paddingless />
            </th>
            <th v-if="columns['cashback_schedule.received_additional_payment_amount']?.isVisible">
              <base-input v-model="filter['cashback_schedule.received_additional_payment_amount']" placeholder="Search..." :readonly="isLoading" border="none" paddingless />
            </th>
            <th v-if="columns['cashback_schedule.remaining_amount']?.isVisible">
              <base-input v-model="filter['cashback_schedule.remaining_amount']" placeholder="Search..." :readonly="isLoading" border="none" paddingless />
            </th>
            <th v-if="columns['cashback_schedule.bank.name']?.isVisible">
              <base-input v-model="filter['cashback_schedule.bank.name']" placeholder="Search..." :readonly="isLoading" border="none" paddingless />
            </th>
            <th v-if="columns['cashback_schedule.bank.account.account_name']?.isVisible">
              <base-input v-model="filter['cashback_schedule.bank.account.account_name']" placeholder="Search..." :readonly="isLoading" border="none" paddingless />
            </th>
            <th v-if="columns['cashback_schedule.bank.account.account_number']?.isVisible">
              <base-input v-model="filter['cashback_schedule.bank.account.account_number']" placeholder="Search..." :readonly="isLoading" border="none" paddingless />
            </th>
            <th v-if="columns['cashback_schedule.additional_bank.name']?.isVisible">
              <base-input v-model="filter['cashback_schedule.additional_bank.name']" placeholder="Search..." :readonly="isLoading" border="none" paddingless />
            </th>
            <th v-if="columns['cashback_schedule.additional_bank.account.account_name']?.isVisible">
              <base-input v-model="filter['cashback_schedule.additional_bank.account.account_name']" placeholder="Search..." :readonly="isLoading" border="none" paddingless />
            </th>
            <th v-if="columns['cashback_schedule.additional_bank.account.account_number']?.isVisible">
              <base-input v-model="filter['cashback_schedule.additional_bank.account.account_number']" placeholder="Search..." :readonly="isLoading" border="none" paddingless />
            </th>
            <th v-if="columns['cashback_schedule.created_by.username']?.isVisible">
              <base-input v-model="filter['cashback_schedule.created_by.username']" placeholder="Search..." :readonly="isLoading" border="none" paddingless />
            </th>
            <th v-if="columns['form_number']?.isVisible">
              <base-input v-model="filter.form_number" placeholder="Search..." :readonly="isLoading" border="none" paddingless />
            </th>
            <th v-if="columns['owner.name']?.isVisible">
              <base-input v-model="filter['owner.name']" placeholder="Search..." :readonly="isLoading" border="none" paddingless />
            </th>
            <th v-if="columns['placement.base_date']?.isVisible">
              <base-input v-model="filter['placement.base_date']" placeholder="Search..." :readonly="isLoading" border="none" paddingless />
            </th>
            <th v-if="columns['placement.date']?.isVisible">
              <base-date-range-picker
                v-model:date_from="filter['placement.date_from']"
                v-model:date_to="filter['placement.date_to']"
                placeholder="Search..."
                :readonly="isLoading"
                border="none"
                paddingless
              />
            </th>
            <th v-if="columns['placement.term']?.isVisible">
              <base-input v-model="filter['placement.term']" placeholder="Search..." :readonly="isLoading" border="none" paddingless />
            </th>
            <th v-if="columns['placement.maturity_date']?.isVisible">
              <!-- <base-input v-model="filter['placement.maturity_date']" placeholder="Search..." :readonly="isLoading" border="none" paddingless /> -->
              <base-date-range-picker
                v-model:date_from="filter['placement.maturity_date_from']"
                v-model:date_to="filter['placement.maturity_date_to']"
                placeholder="Search..."
                :readonly="isLoading"
                border="none"
                paddingless
              />
            </th>
            <th v-if="columns['placement.amount']?.isVisible">
              <base-input v-model="filter['placement.amount']" placeholder="Search..." :readonly="isLoading" border="none" paddingless />
            </th>
            <th v-if="columns['interest.payment_method']?.isVisible">
              <base-input v-model="filter['interest.payment_method']" placeholder="Search..." :readonly="isLoading" border="none" paddingless />
            </th>
            <th v-if="columns['interest.rate']?.isVisible">
              <base-input v-model="filter['interest.rate']" placeholder="Search..." :readonly="isLoading" border="none" paddingless />
            </th>
            <th v-if="columns['interest.gross_amount']?.isVisible">
              <base-input v-model="filter['interest.gross_amount']" placeholder="Search..." :readonly="isLoading" border="none" paddingless />
            </th>
            <th v-if="columns['interest.tax_rate']?.isVisible">
              <base-input v-model="filter['interest.tax_rate']" placeholder="Search..." :readonly="isLoading" border="none" paddingless />
            </th>
            <th v-if="columns['interest.tax_amount']?.isVisible">
              <base-input v-model="filter['interest.tax_amount']" placeholder="Search..." :readonly="isLoading" border="none" paddingless />
            </th>
            <th v-if="columns['interest.net_amount']?.isVisible">
              <base-input v-model="filter['interest.net_amount']" placeholder="Search..." :readonly="isLoading" border="none" paddingless />
            </th>
            <th v-if="columns['notes']?.isVisible">
              <base-input v-model="filter.notes" placeholder="Search..." :readonly="isLoading" border="none" paddingless />
            </th>
            <th v-if="columns['is_archived']?.isVisible">
              <base-choosen
                placeholder="Search..."
                title="Is Archived"
                v-model:options="archivedOptions"
                v-model:selectedValue="filter.is_archived"
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

          <!-- Show no data found message if no deposits and query params exist -->
          <tr v-if="!isLoading && deposits?.length === 0 && route.query">
            <td :colspan="countVisibleColumns + 1">
              <div class="w-full flex-col p-10 items-center justify-center gap-2">
                <p class="text-xl">Data Not Found</p>
                <base-button @click="onResetFilter" variant="filled" color="primary" class="my-2 px-4!">
                  Reset Filter
                </base-button>
              </div>
            </td>
          </tr>

          <!-- Render rows of deposit data when available -->
          <template v-if="!isLoading && deposits && deposits.length > 0">
            <template v-for="(deposit, index) in deposits" :key="index">
              <tr :class="{'bg-red-50 dark:bg-red-800': deposit.status === 'draft'}">
                <td>
                  <!-- Row action menu -->
                  <base-popover placement="bottom" ref="rowMenuRef">
                    <base-button @click="rowMenuRef[index].toggle()">
                      <base-icon class="text-md!" icon="i-fa7-solid:ellipsis-vertical" />
                    </base-button>
                    <template #content>
                      <base-card class="p-0! gap-0! -mt-2" shadow>
                        <div class="flex flex-col">
                          <base-button
                            variant="text"
                            color="info"
                            class="w-full py-1! px-3! m-0! flex gap-2! items-center justify-start text-left!"
                            @click="() => {
                              receiveCashbackModalRef.toggleModal({
                                _id: deposit._id,
                                payment_date: deposit.cashback_schedule?.payment_date,
                                amount: deposit.cashback_schedule?.amount,
                                bank_id: deposit.cashback_schedule?.bank?._id,
                                bank_account_uuid: deposit.cashback_schedule?.bank?.account?.uuid,
                                received_date: deposit.cashback_schedule?.received_date,
                                received_amount: deposit.cashback_schedule?.received_amount,
                                additional_bank_id: deposit.cashback_schedule?.additional_bank?._id,
                                additional_bank_account_uuid: deposit.cashback_schedule?.additional_bank?.account?.uuid,
                                received_additional_payment_date: deposit.cashback_schedule?.received_additional_payment_date,
                                received_additional_payment_amount: deposit.cashback_schedule?.received_additional_payment_amount,
                                readonly: true
                              })
                              rowMenuRef[index].toggle()
                            }"
                          >
                            <base-icon icon="i-fa7-light-book-open-cover" />
                            <p class="flex-1">View</p>
                          </base-button>
                          <base-divider orientation="vertical" class="my-0!" />
                          <base-button
                            variant="text"
                            color="info"
                            class="w-full py-1! px-3! m-0! flex gap-2! items-center justify-start text-left!"
                            @click="() => {
                              receiveCashbackModalRef.toggleModal({
                                _id: deposit._id,
                                payment_date: deposit.cashback_schedule?.payment_date,
                                amount: deposit.cashback_schedule?.amount,
                                bank_id: deposit.cashback_schedule?.bank?._id,
                                bank_account_uuid: deposit.cashback_schedule?.bank?.account?.uuid,
                                received_date: deposit.cashback_schedule?.received_date,
                                received_amount: deposit.cashback_schedule?.received_amount,
                                additional_bank_id: deposit.cashback_schedule?.additional_bank?._id,
                                additional_bank_account_uuid: deposit.cashback_schedule?.additional_bank?.account?.uuid,
                                received_additional_payment_date: deposit.cashback_schedule?.received_additional_payment_date,
                                received_additional_payment_amount: deposit.cashback_schedule?.received_additional_payment_amount,
                              })
                              rowMenuRef[index].toggle()
                            }"
                          >
                            <base-icon icon="i-fa7-light-file-pen" />
                            <p class="flex-1">Edit</p>
                          </base-button>
                        </div>
                      </base-card>
                    </template>
                  </base-popover>
                </td>
                <!-- Deposit fields rendered conditionally based on column visibility -->
                <td v-if="columns['status']?.isVisible" class="text-center">
                  <base-badge v-if="deposit.status === 'draft'" variant="filled" color="danger" class="font-bold w-32 uppercase">
                    <base-icon icon="i-fa7-solid:box-open" /> Draft
                  </base-badge>
                  <base-badge v-else-if="deposit.status === 'active'" variant="filled" color="info" class="font-bold w-32 uppercase">
                    <base-icon icon="i-fa7-solid:box-dollar" /> Active
                  </base-badge>
                  <base-badge v-else-if="deposit.status === 'completed'" variant="filled" color="success" class="font-bold w-32 uppercase">
                    <base-icon icon="i-fa7-solid:box-check" /> Completed
                  </base-badge>
                </td>
                <td v-if="columns['cashback_schedule.status']?.isVisible" class="text-center">
                  <base-button
                    @click="receiveCashbackModalRef.toggleModal({
                      _id: deposit._id,
                      payment_date: deposit.cashback_schedule?.payment_date,
                      amount: deposit.cashback_schedule?.amount,
                    })"
                    v-if="deposit.cashback_schedule?.received_amount === 0 && deposit.status !== 'draft'"
                    variant="filled"
                    color="primary"
                    class="font-bold w-32"
                  >
                    <base-icon icon="i-fa7-solid:money-from-bracket"></base-icon> Receive
                  </base-button>
                  <base-badge v-else-if="(deposit.cashback_schedule?.received_amount ?? 0) > 0 && deposit.status !== 'draft'" variant="filled" color="success" class="font-bold w-32">
                    <base-icon icon="i-fa7-solid:box-check" /> RECEIVED
                  </base-badge>
                </td>
                <td v-if="columns['placement.bilyet_number']?.isVisible">{{ deposit.placement?.bilyet_number }}</td>
                <td class="text-left" v-if="columns['cashback_schedule.payment_date']?.isVisible">{{ deposit.cashback_schedule?.payment_date }}</td>
                <td class="text-left" v-if="columns['cashback_schedule.received_date']?.isVisible">{{ deposit.cashback_schedule?.received_date }}</td>
                <td class="text-left" v-if="columns['cashback_schedule.received_additional_payment_date']?.isVisible">{{ deposit.cashback_schedule?.received_additional_payment_date }}</td>
                <td class="text-right" v-if="columns['cashback_schedule.amount']?.isVisible">{{ formatNumber(deposit.cashback_schedule?.amount, 2) }}</td>
                <td class="text-right" v-if="columns['cashback_schedule.received_amount']?.isVisible">{{ formatNumber(deposit.cashback_schedule?.received_amount, 2) }}</td>
                <td class="text-right" v-if="columns['cashback_schedule.received_additional_payment_amount']?.isVisible">{{ formatNumber(deposit.cashback_schedule?.received_additional_payment_amount, 2) }}</td>
                <td class="text-right" v-if="columns['cashback_schedule.remaining_amount']?.isVisible">{{ formatNumber(roundNumber((deposit.cashback_schedule?.amount ?? 0) - (deposit.cashback_schedule?.received_amount ?? 0) - (deposit.cashback_schedule?.received_additional_payment_amount ?? 0), 2), 2) }}</td>
                <td class="text-right" v-if="columns['cashback_schedule.bank.name']?.isVisible">{{ deposit.cashback_schedule?.bank?.name }}</td>
                <td class="text-right" v-if="columns['cashback_schedule.bank.account.account_name']?.isVisible">{{ deposit.cashback_schedule?.bank?.account?.account_name }}</td>
                <td class="text-right" v-if="columns['cashback_schedule.bank.account.account_number']?.isVisible">{{ deposit.cashback_schedule?.bank?.account?.account_number }}</td>
                <td class="text-right" v-if="columns['cashback_schedule.additional_bank.name']?.isVisible">{{ deposit.cashback_schedule?.additional_bank?.name }}</td>
                <td class="text-right" v-if="columns['cashback_schedule.additional_bank.account.account_name']?.isVisible">{{ deposit.cashback_schedule?.additional_bank?.account?.account_name }}</td>
                <td class="text-right" v-if="columns['cashback_schedule.additional_bank.account.account_number']?.isVisible">{{ deposit.cashback_schedule?.additional_bank?.account?.account_number }}</td>
                <td class="text-right" v-if="columns['cashback_schedule.created_by.username']?.isVisible">{{ deposit.cashback_schedule?.created_by?.username }}</td>
                <td v-if="columns['form_number']?.isVisible">
                  <router-link :to="`/deposits/${deposit._id}`" class="text-blue">{{ deposit.form_number }}</router-link>
                </td>
                <td v-if="columns['owner.name']?.isVisible">
                  <router-link :to="`/master/owners/${deposit.owner?._id}`" class="text-blue">{{ deposit.owner?.name }}</router-link>
                </td>
                <td v-if="columns['placement.base_date']?.isVisible">{{ deposit.placement?.base_date }}</td>
                <td v-if="columns['placement.date']?.isVisible">{{ deposit.placement?.date }}</td>
                <td v-if="columns['placement.term']?.isVisible">{{ deposit.placement?.term }}</td>
                <td v-if="columns['placement.maturity_date']?.isVisible">{{ deposit.placement?.maturity_date }}</td>
                <td v-if="columns['placement.amount']?.isVisible">{{ formatNumber(deposit.placement?.amount, 2) }}</td>
                <td v-if="columns['interest.payment_method']?.isVisible">{{ deposit.interest?.payment_method }}</td>
                <td v-if="columns['interest.rate']?.isVisible">{{ formatNumber(deposit.interest?.rate, 2) }}</td>
                <td v-if="columns['interest.gross_amount']?.isVisible">{{ formatNumber(deposit.interest?.gross_amount, 2) }}</td>
                <td v-if="columns['interest.tax_rate']?.isVisible">{{ formatNumber(deposit.interest?.tax_rate, 2) }}</td>
                <td v-if="columns['interest.tax_amount']?.isVisible">{{ formatNumber(deposit.interest?.tax_amount, 2) }}</td>
                <td v-if="columns['interest.net_amount']?.isVisible">{{ formatNumber(deposit.interest?.net_amount, 2) }}</td>
                <td v-if="columns['notes']?.isVisible">{{ deposit.notes }}</td>
                <td v-if="columns['is_archived']?.isVisible">
                  <base-badge v-if="deposit.is_archived" variant="filled" color="danger" class="font-bold">
                    <base-icon icon="i-fa7-solid:box-archive" /> ARCHIVED
                  </base-badge>
                  <base-badge v-else variant="filled" color="success" class="font-bold">
                    <base-icon icon="i-fa7-solid:box-check" /> ACTIVE
                  </base-badge>
                </td>
              </tr>
            </template>
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
