<script setup lang="ts">
import { computed } from 'vue';

import { useSelectableBankAccounts } from '@/composables/selectable/bank-accounts';
import { formatNumber } from '@/utils/number';

import { type IForm } from './form';

const data = defineModel<IForm>('data', {
  default: () => ({
    cashback: {
      bank: undefined,
    },
    cashback_schedule: {
      payment_date: undefined,
      amount: undefined,
      received_date: undefined,
      received_amount: undefined,
      bank: undefined,
    },
  }),
});

const totalScheduledCashback = computed(() =>
  data.value.cashback_schedule.reduce(
    (sum, item) => sum + (item.amount ?? 0),
    0,
  ),
);

const { getLabel } = useSelectableBankAccounts();
</script>

<template>
  <base-card title="Cashback Info">
    <div class="flex flex-col gap-4">
      <div class="flex flex-col gap-4">
        <base-input
          layout="h"
          label="Bank"
          disabled
          :model-value="getLabel({
            bank_name: data.cashback?.bank?.name,
            bank_account_name: data.cashback?.bank?.account?.account_name,
            bank_account_number: data.cashback?.bank?.account?.account_number
          })"
        />
      </div>
    </div>
  </base-card>
  <base-card title="Cashback Schedule">
    <base-table>
      <thead>
        <tr>
          <th colspan="3"></th>
          <th colspan="3" class="border-x border-slate-200 text-center">Received</th>
          <th class="w-1"></th>
        </tr>
        <tr>
          <th>Payment Date</th>
          <th class="text-right w-1">Rate</th>
          <th class="text-right w-1">Amount</th>
          <th class="text-right w-1">Date</th>
          <th class="text-right w-1">Amount</th>
          <th class="text-right w-1">Bank</th>
          <th class="text-right whitespace-nowrap w-1">Created By</th>
          <th class="w-1"></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(cashbackSchedule, index) in data.cashback_schedule">
          <td>{{ cashbackSchedule.payment_date }}</td>
          <td class="text-right w-1">{{ formatNumber(cashbackSchedule.rate, 2) }}</td>
          <td class="text-right">{{ formatNumber(cashbackSchedule.amount, 2) }}</td>
          <td></td>
          <td></td>
        </tr>
        <tr class="font-bold">
          <td colspan="2" class="text-right"></td>
          <td class="text-right">{{ formatNumber(totalScheduledCashback, 2) }}</td>
          <td></td>
          <td class="text-right">{{ formatNumber(totalScheduledCashback, 2) }}</td>
          <td></td>
          <td></td>
          <td></td>
        </tr>
      </tbody>
    </base-table>
  </base-card>
</template>

<style scoped lang="postcss"></style>
