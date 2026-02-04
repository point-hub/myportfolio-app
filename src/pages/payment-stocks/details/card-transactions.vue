<script setup lang="ts">
import { watchEffect } from 'vue';

import { formatNumber } from '@/utils/number';

import { type IForm } from './form';

const data = defineModel<IForm>('data');

watchEffect(() => {
  if (!data.value) {
    return;
  }

  data.value.total = data.value?.transactions?.reduce((sum, item) => {
    return sum + (item.amount ?? 0);
  }, 0) ?? 0;
});
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
          <td>{{ transaction.transaction_number }}</td>
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
