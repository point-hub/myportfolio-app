<script setup lang="ts">
import { watchDebounced } from '@vueuse/core';
import { onMounted, reactive, ref } from 'vue';

import BaseDateRangePicker from '@/components/base-date-range-picker.vue';
import { exportStockHoldingsApi, getStockHoldingsApi, type IStockHoldingData } from '@/composables/api/stocks/get-holdings.api';
import { useSelectableBrokers } from '@/composables/selectable/brokers';
import { useSelectableIssuers } from '@/composables/selectable/issuers';
import { toast } from '@/toast';
import { handleError } from '@/utils/api';
import { formatNumber } from '@/utils/number';

const today = new Date();
const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
const firstDayOfMonth = formatDate(new Date(today.getFullYear(), today.getMonth(), 1));
const lastDayOfMonth = formatDate(new Date(today.getFullYear(), today.getMonth() + 1, 0));

const { options: brokerOptions } = useSelectableBrokers();
const { options: issuerOptions } = useSelectableIssuers();

const filter = reactive({
  transaction_date_from: firstDayOfMonth,
  transaction_date_to: lastDayOfMonth,
  broker_id: '',
  issuer_id: '',
});
const pagination = reactive({
  page: 1,
  page_count: 1,
  page_size: 10,
  total_document: 0,
});
const holdings = ref<IStockHoldingData[]>([]);
const isLoading = ref(false);
const isExporting = ref(false);

const getHoldings = async (page = 1) => {
  try {
    isLoading.value = true;
    const response = await getStockHoldingsApi({
      search: filter,
      page,
      page_size: pagination.page_size,
    });
    holdings.value = response.data;
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

const applyFilter = async () => {
  pagination.page = 1;
  await getHoldings();
};

const onReset = async () => {
  const isFilterChanged = filter.transaction_date_from !== firstDayOfMonth
    || filter.transaction_date_to !== lastDayOfMonth
    || filter.broker_id !== ''
    || filter.issuer_id !== '';

  filter.transaction_date_from = firstDayOfMonth;
  filter.transaction_date_to = lastDayOfMonth;
  filter.broker_id = '';
  filter.issuer_id = '';

  if (!isFilterChanged) {
    await applyFilter();
  }
};

const onPageUpdate = async () => {
  await getHoldings(pagination.page);
};

const onExport = async () => {
  try {
    isExporting.value = true;
    const blob = await exportStockHoldingsApi({ search: filter });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'stock-holdings.xls';
    link.click();
    window.URL.revokeObjectURL(url);
    toast('Export success', { color: 'success' });
  } catch (error) {
    const errorResponse = handleError(error);
    if (errorResponse.message) {
      toast(errorResponse.message, {
        lists: errorResponse.lists,
        color: 'danger',
      });
    }
  } finally {
    isExporting.value = false;
  }
};

onMounted(async () => {
  await getHoldings();
});

watchDebounced(filter, applyFilter, { debounce: 500, maxWait: 1000 });
</script>

<template>
  <base-card title="Stock Holdings">
    <div class="flex flex-col gap-6">
      <div>
        <h2 class="text-lg font-bold">Halaman ini menampilkan Stock Holding pada setiap kode instrumen saham</h2>
        <p class="text-sm text-slate-500 dark:text-slate-400">Kelola laporan kepemilikan saham berdasarkan broker dan kode instrumen.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
        <base-date-range-picker
          v-model:date_from="filter.transaction_date_from"
          v-model:date_to="filter.transaction_date_to"
          label="Date"
          border="full"
          :readonly="isLoading"
        />
        <base-choosen
          v-model="filter.broker_id"
          :options="brokerOptions"
          title="Broker"
          placeholder="All Broker"
          border="full"
        />
        <base-choosen
          v-model="filter.issuer_id"
          :options="issuerOptions"
          title="Instrument"
          placeholder="All Instrument"
          border="full"
        />
        <div class="flex items-end gap-2">
          <base-button color="info" :disabled="isLoading" class="font-bold" @click="onReset">
            <base-icon icon="i-fa7-solid-rotate-left" /> Reset
          </base-button>
          <base-button color="success" :disabled="isLoading || isExporting" class="font-bold" @click="onExport">
            <base-icon icon="i-fa7-solid-file-export" /> Export
          </base-button>
        </div>
      </div>

      <base-table>
        <thead>
          <tr>
            <th>Instrument Code</th>
            <th>Instrument Name</th>
            <th>Broker</th>
            <th class="text-right">Number of Shares</th>
            <th class="text-right">Total Buying Price</th>
            <th class="text-right">Average Buying Price</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="isLoading">
            <td colspan="6">
              <p class="w-full p-10 h-32 flex items-center gap-2 text-xl">
                <base-loader type="classic" sample="2" />
              </p>
            </td>
          </tr>
          <tr v-if="!isLoading && holdings.length === 0">
            <td colspan="6">
              <div class="w-full flex-col p-10 items-center justify-center gap-2">
                <p class="text-xl">Data Not Found</p>
              </div>
            </td>
          </tr>
          <template v-if="!isLoading && holdings.length > 0">
            <tr v-for="holding in holdings" :key="`${holding.broker_id}-${holding.issuer_id}`">
              <td>{{ holding.issuer?.code }}</td>
              <td>{{ holding.issuer?.name }}</td>
              <td>{{ holding.broker?.name || 'All Broker' }}</td>
              <td class="text-right">{{ formatNumber(holding.number_of_shares, 0) }}</td>
              <td class="text-right">{{ formatNumber(holding.total_buying_price, 2) }}</td>
              <td class="text-right">{{ formatNumber(holding.average_buying_price, 2) }}</td>
            </tr>
          </template>
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
</template>
