<script setup lang="ts">
import { ref, watch, watchEffect } from 'vue';

import { getIssuersStocksApi, type IStockData } from '@/composables/api/stocks/get-issuers.api';

import { type IForm, type IFormError, type ITransaction } from './form';

const data = defineModel<IForm>('data');
const errors = defineModel<IFormError>('errors');

const stocks = ref();
const issuers = ref();
interface IOption {
  label: string
  value?: string
  owner_id?: string
  owner_name?: string
}
const getStocks = async (broker_id?: string) => {
  if (!broker_id) {
    return;
  }

  const res = await getIssuersStocksApi({
    search: {
      broker_id,
    },
  });

  stocks.value = res;

  issuers.value =
    res?.data?.map((item: IStockData) => ({
      label: `${item.buying_list?.issuer?.code} - ${item.buying_list?.issuer?.name}`,
      value: item.buying_list?.issuer_id,
      owner_id: item.owner_id,
      owner_name: item.owner?.name,
    })) ?? [];
};

watch(
  () => data.value?.broker_id,
  (broker_id) => {
    if (!broker_id) return;
    getStocks(broker_id);
  },
  { immediate: true },
);


watchEffect(() => {
  if (!data.value) return;

  // Calculate total dividend per transaction
  data.value.transactions?.forEach((element) => {
    element.total_dividend = (element.shares ?? 0) * (element.dividend_amount ?? 0);
  });

  // Calculate total_received (sum of all received_amount)
  data.value.total_received = data.value.transactions?.reduce((sum, item) => {
    return sum + (item.received_amount ?? 0);
  }, 0) ?? 0;
});

const onSelected = (selected: IOption, transaction: ITransaction) => {
  transaction.owner_id = selected?.owner_id;
  transaction.owner = {
    _id: selected?.owner_id ?? '',
    code: selected?.owner_name ?? '',
    name: selected?.owner_name ?? '',
  };
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const onDelete = (index: number) => {
  data.value?.transactions?.splice(index, 1);
};
</script>

<template>
  <base-card title="transactions">
    <base-table class="min-h-48">
      <thead>
        <tr>
          <th class="w-1">No</th>
          <th>Issuer</th>
          <th>Owner</th>
          <th class="text-right whitespace-nowrap w-32">Number of Shares</th>
          <th class="text-right whitespace-nowrap w-32">Dividend per share</th>
          <th class="text-right whitespace-nowrap w-32">Total Dividend</th>
          <th class="text-right whitespace-nowrap w-32">Amount Received</th>
          <th class="w-1"></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(transaction, index) in data?.transactions">
          <td class="text-center">{{ index + 1 }}</td>
          <td>
            <base-choosen
              title="Issuer"
              v-model="transaction.issuer_id"
              :options="issuers"
              :errors="errors?.[`transactions.${index}.issuer_id`]"
              @select="(selected: IOption) => onSelected(selected, transaction)"
              disabled
              placeholder="Select"
              border="none"
              paddingless
            />
          </td>
          <td>{{ transaction.owner?.name }}</td>
          <td><base-input-number v-model="transaction.shares" disabled decimal-length="2" border="none" paddingless /></td>
          <td><base-input-number v-model="transaction.dividend_amount" disabled decimal-length="2" border="none" paddingless /></td>
          <td><base-input-number v-model="transaction.total_dividend" disabled decimal-length="2" border="none" paddingless /></td>
          <td><base-input-number v-model="transaction.received_amount" disabled decimal-length="2" border="none" paddingless /></td>
        </tr>
        <tr>
          <td></td>
          <td colspan="5" class="text-right font-bold">TOTAL</td>
          <td><base-input-number :model-value="data?.total_received" disabled decimal-length="2" border="none" paddingless /></td>
        </tr>
      </tbody>
    </base-table>
  </base-card>
</template>

<style scoped lang="postcss"></style>
