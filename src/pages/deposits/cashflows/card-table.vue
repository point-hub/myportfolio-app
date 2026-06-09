<script setup lang="ts">
import { watchDebounced } from '@vueuse/core';
import { onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import BaseDateRangePicker from '@/components/base-date-range-picker.vue';
import TableSettingModal from '@/components/table-setting-modal.vue';
import { exportDepositCashflowsApi } from '@/composables/api/deposits/export-cashflows.api';
import { getDepositCashflowsApi, type ICashflowData } from '@/composables/api/deposits/get-cashflows.api';
import { useQueryParams } from '@/composables/query-params';
import { useTableFilter } from '@/composables/table-filter';
import { useTableSetting } from '@/composables/table-setting';
import { toast } from '@/toast';
import { handleError } from '@/utils/api';
import { formatDatetime } from '@/utils/date';
import { formatNumber } from '@/utils/number';

const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const today = new Date();
const defaultDateFrom = formatDate(new Date(today.getFullYear(), today.getMonth(), 1));
const defaultDateTo = formatDate(today);

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
    transaction_date: { label: 'Date Form', isVisible: true, isSelectable: true },
    form_number: { label: 'Form Number', isVisible: true, isSelectable: true },
    investment_type: { label: 'Jenis Investasi', isVisible: true, isSelectable: true },
    'bank_account.account.account_number': { label: 'Rekening Bank', isVisible: true, isSelectable: true },
    'placement_bank.name': { label: 'Bank', isVisible: true, isSelectable: true },
    description: { label: 'Keterangan', isVisible: true, isSelectable: true },
    income: { label: 'Pendapatan', isVisible: true, isSelectable: true },
    principal_balance: { label: 'Saldo Nominal Pokok', isVisible: true, isSelectable: true },
    notes: { label: 'Notes / Biaya', isVisible: true, isSelectable: true },
    income_debit: { label: 'Debit Pendapatan', isVisible: true, isSelectable: true },
    income_credit: { label: 'Kredit Pendapatan', isVisible: true, isSelectable: true },
    'income_account.account.account_number': { label: 'Rekening Pendapatan', isVisible: true, isSelectable: true },
    balance: { label: 'Saldo', isVisible: true, isSelectable: true },
  },
});

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
    transaction_type: '',
    transaction_date_from: defaultDateFrom,
    transaction_date_to: defaultDateTo,
    form_number: '',
    investment_type: '',
    'bank_account.name': '',
    'bank_account.account.account_name': '',
    'bank_account.account.account_number': '',
    'placement_bank.name': '',
    description: '',
    income: '',
    principal_balance: '',
    notes: '',
    income_debit: '',
    income_credit: '',
    'income_account.name': '',
    'income_account.account.account_name': '',
    'income_account.account.account_number': '',
    balance: '',
  },
  initialSortKeys: {
    transaction_date: 1,
    form_number: 0,
    investment_type: 0,
    'bank_account.account.account_number': 0,
    'placement_bank.name': 0,
    description: 0,
    income: 0,
    principal_balance: 0,
    notes: 0,
    income_debit: 0,
    income_credit: 0,
    'income_account.account.account_number': 0,
    balance: 0,
  },
});

const { updateQueryParams, applyQueryParams } = useQueryParams();
const route = useRoute();
const router = useRouter();

const cashflows = ref<ICashflowData[]>();
const isInitialSetup = ref(true);
const isLoading = ref(false);
const isExporting = ref(false);
const exportLink = ref('');
const exportExpiresAt = ref('');
const transactionTypeOptions = ref([
  { label: 'Placement', value: 'placement' },
  { label: 'Withdrawal', value: 'withdrawal' },
  { label: 'Realised Interest', value: 'realised-interest' },
]);

const bankAccountLabel = (cashflow?: ICashflowData['bank_account']) => {
  return [
    cashflow?.name,
    cashflow?.account?.account_number,
    cashflow?.account?.account_name,
  ].filter(Boolean).join(' - ');
};

const onPageUpdate = async () => {
  if (!isInitialSetup.value) {
    await getCashflows(pagination.page);
    await updateQueryParams({ page: pagination.page.toString() });
  }
};

const resetPageAndFetch = async () => {
  pagination.page = 1;
  await updateQueryParams({ page: 1 });
  await getCashflows();
};

const getCashflows = async (page = 1) => {
  try {
    isLoading.value = true;
    const response = await getDepositCashflowsApi({
      search: filter,
      sort: sortObjectToString(sort),
      page,
      page_size: pagination.page_size,
    });
    cashflows.value = response.data;
    Object.assign(pagination, response.pagination);
  } catch (error) {
    const errorResponse = handleError(error);
    if (errorResponse.message) {
      toast(errorResponse.message, { lists: errorResponse.lists, color: 'danger' });
    }
  } finally {
    isLoading.value = false;
  }
};

const onExport = async () => {
  try {
    isExporting.value = true;
    const response = await exportDepositCashflowsApi({
      search: filter,
      sort: sortObjectToString(sort),
    });
    exportLink.value = response.url;
    exportExpiresAt.value = response.expires_at;
    toast(`Export link generated. Expired at ${formatDatetime(response.expires_at)}`, { color: 'success' });
  } catch (error) {
    const errorResponse = handleError(error);
    if (errorResponse.message) {
      toast(errorResponse.message, { lists: errorResponse.lists, color: 'danger' });
    }
  } finally {
    isExporting.value = false;
  }
};

const onResetFilter = async () => {
  isInitialSetup.value = true;
  await router.push({ query: undefined });
  resetPagination(pageSize.value.size);
  resetTableSetting();
  resetFilter();
  await getCashflows();
  setTimeout(() => { isInitialSetup.value = false; }, 1000);
};

watchDebounced(filter, async () => {
  if (!isInitialSetup.value) {
    await updateQueryParams({ search: filter });
    await resetPageAndFetch();
  }
}, { debounce: 500 });

watch(sort, async () => {
  if (!isInitialSetup.value) {
    await updateQueryParams({ sort: sortObjectToString(sort) });
    await resetPageAndFetch();
  }
}, { deep: true });

watch(pageSize, async () => {
  pagination.page_size = pageSize.value.size;
  if (!isInitialSetup.value) {
    await updateQueryParams({ 'page-size': pageSize.value.size });
    await resetPageAndFetch();
  }
}, { deep: true });

watch(visibleColumns, async () => {
  if (!isInitialSetup.value) {
    await updateQueryParams({ columns: visibleColumns.value });
  }
}, { deep: true });

onMounted(async () => {
  applyQueryParams({
    query: route.query,
    filter,
    sort,
    pagination,
    pageSize,
    pageSizeOptions,
    columns,
  });
  await getCashflows(pagination.page);
  setTimeout(() => { isInitialSetup.value = false; }, 1000);
});
</script>

<template>
  <base-card>
    <div class="flex flex-col gap-4">
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2">
        <base-input v-model="filter.all" placeholder="Search cashflow..." :readonly="isLoading" />
        <div class="flex gap-2">
          <base-button variant="filled" color="info" class="font-bold" @click="open">
            <base-icon icon="i-fa7-solid:gear" /> SETTING
          </base-button>
          <base-button variant="filled" color="success" class="font-bold" :disabled="isExporting" @click="onExport">
            <base-icon icon="i-fa7-solid:file-export" /> EXPORT
          </base-button>
          <base-button variant="filled" color="primary" class="font-bold" :disabled="isLoading" @click="onResetFilter">
            <base-icon icon="i-fa7-solid:rotate-left" /> RESET
          </base-button>
        </div>
      </div>

      <div v-if="exportLink" class="flex flex-col lg:flex-row lg:items-center gap-2 rounded border border-slate-200 dark:border-slate-700 p-3">
        <div class="flex-1 min-w-0">
          <p class="text-sm font-bold">Export Link</p>
          <a :href="exportLink" target="_blank" class="block text-blue truncate">{{ exportLink }}</a>
          <p class="text-xs text-slate-500">Expired at {{ formatDatetime(exportExpiresAt) }}</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-2">
        <base-choosen
          title="Transaction Type"
          placeholder="All transaction"
          v-model:options="transactionTypeOptions"
          v-model="filter.transaction_type"
          :disabled="isLoading"
        />
        <base-date-range-picker
          label="Date Form"
          v-model:date_from="filter.transaction_date_from"
          v-model:date_to="filter.transaction_date_to"
          :readonly="isLoading"
        />
      </div>

      <base-table class="whitespace-nowrap">
        <thead>
          <tr>
            <th v-if="columns['transaction_date']?.isVisible" @click="toggleSort('transaction_date')">Date Form</th>
            <th v-if="columns['form_number']?.isVisible" @click="toggleSort('form_number')">Form Number</th>
            <th v-if="columns['investment_type']?.isVisible" @click="toggleSort('investment_type')">Jenis Investasi</th>
            <th v-if="columns['bank_account.account.account_number']?.isVisible" @click="toggleSort('bank_account.account.account_number')">Rekening Bank</th>
            <th v-if="columns['placement_bank.name']?.isVisible" @click="toggleSort('placement_bank.name')">Bank</th>
            <th v-if="columns['description']?.isVisible" @click="toggleSort('description')">Keterangan</th>
            <th v-if="columns['income']?.isVisible" @click="toggleSort('income')">Pendapatan</th>
            <th v-if="columns['principal_balance']?.isVisible" @click="toggleSort('principal_balance')">Saldo Nominal Pokok</th>
            <th v-if="columns['notes']?.isVisible" @click="toggleSort('notes')">Notes / Biaya</th>
            <th v-if="columns['income_debit']?.isVisible" @click="toggleSort('income_debit')">Debit Pendapatan</th>
            <th v-if="columns['income_credit']?.isVisible" @click="toggleSort('income_credit')">Kredit Pendapatan</th>
            <th v-if="columns['income_account.account.account_number']?.isVisible" @click="toggleSort('income_account.account.account_number')">Rekening Pendapatan</th>
            <th v-if="columns['balance']?.isVisible" @click="toggleSort('balance')">Saldo</th>
          </tr>
          <tr>
            <th v-if="columns['transaction_date']?.isVisible">
              <base-date-range-picker v-model:date_from="filter.transaction_date_from" v-model:date_to="filter.transaction_date_to" placeholder="Search..." :readonly="isLoading" border="none" paddingless />
            </th>
            <th v-if="columns['form_number']?.isVisible">
              <base-input v-model="filter.form_number" placeholder="Search..." :readonly="isLoading" border="none" paddingless />
            </th>
            <th v-if="columns['investment_type']?.isVisible">
              <base-input v-model="filter.investment_type" placeholder="Search..." :readonly="isLoading" border="none" paddingless />
            </th>
            <th v-if="columns['bank_account.account.account_number']?.isVisible">
              <base-input v-model="filter['bank_account.account.account_number']" placeholder="Search..." :readonly="isLoading" border="none" paddingless />
            </th>
            <th v-if="columns['placement_bank.name']?.isVisible">
              <base-input v-model="filter['placement_bank.name']" placeholder="Search..." :readonly="isLoading" border="none" paddingless />
            </th>
            <th v-if="columns['description']?.isVisible">
              <base-input v-model="filter.description" placeholder="Search..." :readonly="isLoading" border="none" paddingless />
            </th>
            <th v-if="columns['income']?.isVisible">
              <base-input v-model="filter.income" placeholder="Search..." :readonly="isLoading" border="none" paddingless />
            </th>
            <th v-if="columns['principal_balance']?.isVisible">
              <base-input v-model="filter.principal_balance" placeholder="Search..." :readonly="isLoading" border="none" paddingless />
            </th>
            <th v-if="columns['notes']?.isVisible">
              <base-input v-model="filter.notes" placeholder="Search..." :readonly="isLoading" border="none" paddingless />
            </th>
            <th v-if="columns['income_debit']?.isVisible">
              <base-input v-model="filter.income_debit" placeholder="Search..." :readonly="isLoading" border="none" paddingless />
            </th>
            <th v-if="columns['income_credit']?.isVisible">
              <base-input v-model="filter.income_credit" placeholder="Search..." :readonly="isLoading" border="none" paddingless />
            </th>
            <th v-if="columns['income_account.account.account_number']?.isVisible">
              <base-input v-model="filter['income_account.account.account_number']" placeholder="Search..." :readonly="isLoading" border="none" paddingless />
            </th>
            <th v-if="columns['balance']?.isVisible">
              <base-input v-model="filter.balance" placeholder="Search..." :readonly="isLoading" border="none" paddingless />
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="isLoading">
            <td :colspan="countVisibleColumns">
              <p class="w-full p-10 h-32 flex items-center gap-2 text-xl">
                <base-loader type="classic" sample="2" />
              </p>
            </td>
          </tr>
          <tr v-if="!isLoading && cashflows?.length === 0">
            <td :colspan="countVisibleColumns">
              <div class="w-full flex-col p-10 items-center justify-center gap-2">
                <p class="text-xl">Data Not Found</p>
                <base-button @click="onResetFilter" variant="filled" color="primary" class="my-2 px-4!">
                  Reset Filter
                </base-button>
              </div>
            </td>
          </tr>
          <tr v-for="cashflow in cashflows" :key="cashflow._id">
            <td v-if="columns['transaction_date']?.isVisible">{{ cashflow.transaction_date }}</td>
            <td v-if="columns['form_number']?.isVisible">
              <router-link :to="`/deposits/${cashflow.deposit_id}`" class="text-blue">{{ cashflow.form_number }}</router-link>
            </td>
            <td v-if="columns['investment_type']?.isVisible">{{ cashflow.investment_type }}</td>
            <td v-if="columns['bank_account.account.account_number']?.isVisible">{{ bankAccountLabel(cashflow.bank_account) }}</td>
            <td v-if="columns['placement_bank.name']?.isVisible">{{ cashflow.placement_bank?.name }}</td>
            <td v-if="columns['description']?.isVisible">{{ cashflow.description }}</td>
            <td class="text-right" v-if="columns['income']?.isVisible">{{ formatNumber(cashflow.income, 2) }}</td>
            <td class="text-right" v-if="columns['principal_balance']?.isVisible">{{ formatNumber(cashflow.principal_balance, 2) }}</td>
            <td v-if="columns['notes']?.isVisible">{{ cashflow.notes }}</td>
            <td class="text-right" v-if="columns['income_debit']?.isVisible">{{ formatNumber(cashflow.income_debit, 2) }}</td>
            <td class="text-right" v-if="columns['income_credit']?.isVisible">{{ formatNumber(cashflow.income_credit, 2) }}</td>
            <td v-if="columns['income_account.account.account_number']?.isVisible">{{ bankAccountLabel(cashflow.income_account) }}</td>
            <td class="text-right" v-if="columns['balance']?.isVisible">{{ formatNumber(cashflow.balance, 2) }}</td>
          </tr>
        </tbody>
      </base-table>

      <base-pagination
        v-if="!isLoading"
        v-model="pagination.page"
        :page-size="pagination.page_size"
        :total-document="pagination.total_document"
        @update:model-value="onPageUpdate()"
      />
    </div>
  </base-card>

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
