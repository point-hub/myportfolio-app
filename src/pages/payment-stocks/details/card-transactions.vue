<script setup lang="ts">
import { watch, watchEffect } from 'vue';

import { useSelectableStocks } from '@/composables/selectable/stocks';
import { formatNumber } from '@/utils/number';

import { type IForm } from './form';

const data = defineModel<IForm>('data');

const { options: stockOptions, searchStock, addOption } = useSelectableStocks();

watchEffect(() => {
  if (!data.value) {
    return;
  }

  data.value.total = data.value?.transactions?.reduce((sum, item) => {
    return sum + (item.amount ?? 0);
  }, 0) ?? 0;
});

watch(
  () => data.value?.transactions,
  (transactions) => {
    if (!transactions?.length) return;

    transactions.forEach(transaction => {
      if (!transaction.stock_id) return;

      addOption({
        label: transaction.transaction_number ?? '',
        value: transaction.stock_id,
        transaction_number: transaction.transaction_number ?? '',
        date: transaction.date ?? '',
        amount: transaction.amount ?? 0,
      });
    });
  },
  { immediate: true, deep: true },
);
</script>

<template>
  <base-card title="transactions">
    <base-table class="min-h-48">
      <thead>
        <tr>
          <th class="w-1">No</th>
          <th class="whitespace-nowrap">Trasanction Number</th>
          <th class="whitespace-nowrap">Transaction Date</th>
          <th class="text-right w-32">Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(transaction, index) in data?.transactions">
          <td class="text-center">{{ index + 1 }}</td>
          <td>
            <base-choosen
              title="Transaction Number"
              v-model:selectedValue="transaction.stock_id"
              v-model:search="searchStock"
              :options="stockOptions"
              disabled
              placeholder="Select"
              border="none"
              paddingless
            />
          </td>
          <td>{{ transaction.date }}</td>
          <td class="text-right">{{ formatNumber(transaction?.amount, 2) }}</td>
        </tr>
        <tr>
          <td></td>
          <td></td>
          <td class="text-right font-bold">TOTAL</td>
          <td class="text-right">{{ formatNumber(data?.total, 2) }}</td>
        </tr>
      </tbody>
    </base-table>
  </base-card>
</template>

<style scoped lang="postcss"></style>
