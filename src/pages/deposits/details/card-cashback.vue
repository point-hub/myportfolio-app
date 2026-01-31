<script setup lang="ts">
import { computed } from 'vue';

import { useSelectableBankAccounts } from '@/composables/selectable/bank-accounts';
import { formatNumber, roundNumber } from '@/utils/number';

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
      received_additonal_date: undefined,
      received_additonal_amount: undefined,
      bank: undefined,
      additional_bank: undefined,
    },
  }),
});

const totalScheduledAmount = computed(() =>
  data.value.cashback_schedule.reduce(
    (sum, item) => sum + (item.amount ?? 0),
    0,
  ),
);

const totalScheduledReceivedAmount = computed(() => {
  if (!data.value.cashback_schedule?.length) return 0;

  const total = data.value.cashback_schedule.reduce((sum, item) => {
    const amount = item.received_amount ?? 0;
    return sum + amount;
  }, 0);
  return roundNumber(total, 2);
});

const totalScheduledReceivedAdditionalPaymentAmount = computed(() => {
  if (!data.value.cashback_schedule?.length) return 0;

  const total = data.value.cashback_schedule.reduce((sum, item) => {
    const amount = item.received_additional_payment_amount ?? 0;
    return sum + amount;
  }, 0);
  return roundNumber(total, 2);
});

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
          <th colspan="3" class="border-x border-slate-200 bg-slate-50 dark:bg-slate-700 dark:text-white text-center">Received</th>
          <th colspan="3" class="border-x border-slate-200 bg-slate-50 dark:bg-slate-700 dark:text-white text-center">Received Additional Payment</th>
          <th class="w-1"></th>
        </tr>
        <tr>
          <th>Payment Date</th>
          <th class="text-right w-1">Rate</th>
          <th class="text-right w-1">Amount</th>
          <th class="text-right w-1">Date</th>
          <th class="text-right w-1">Amount</th>
          <th class="text-right w-1">Bank</th>
          <th class="text-right w-1">Date</th>
          <th class="text-right w-1">Amount</th>
          <th class="text-right w-1">Bank</th>
          <th class="text-right w-1">Remaining</th>
          <th class="text-right whitespace-nowrap w-1">Created By</th>
          <th class="text-right whitespace-nowrap w-1">Created At</th>
          <th class="w-1"></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(cashbackSchedule, index) in data.cashback_schedule">
          <td>{{ cashbackSchedule.payment_date }}</td>
          <td class="text-right w-1">{{ formatNumber(cashbackSchedule.rate, 2) }}</td>
          <td class="text-right">{{ formatNumber(cashbackSchedule.amount, 2) }}</td>
          <td class="text-right whitespace-nowrap">{{ cashbackSchedule?.received_date }}</td>
          <td class="text-right">{{ formatNumber(cashbackSchedule.received_amount ?? 0, 2) }}</td>
          <td class="whitespace-nowrap">
            {{
              getLabel({
                bank_name: cashbackSchedule.bank?.name,
                bank_account_name: cashbackSchedule.bank?.account?.account_name,
                bank_account_number: cashbackSchedule.bank?.account?.account_number,
              })
            }}
          </td>
          <td class="text-right whitespace-nowrap">{{ cashbackSchedule?.received_additional_payment_date }}</td>
          <td class="text-right">{{ formatNumber(cashbackSchedule.received_additional_payment_amount ?? 0, 2) }}</td>
          <td class="whitespace-nowrap">
            {{
              getLabel({
                bank_name: cashbackSchedule.additional_bank?.name,
                bank_account_name: cashbackSchedule.additional_bank?.account?.account_name,
                bank_account_number: cashbackSchedule.additional_bank?.account?.account_number,
              })
            }}
          </td>
          <td class="text-right">{{ formatNumber((cashbackSchedule?.amount ?? 0) - (cashbackSchedule.received_amount ?? 0) - (cashbackSchedule.received_additional_payment_amount ?? 0), 2) }}</td>
          <td class="text-right">{{ cashbackSchedule.created_by?.username }}</td>
          <td class="text-right">{{ cashbackSchedule.created_at }}</td>
          <td></td>
        </tr>
        <tr class="font-bold">
          <td colspan="2" class="text-right"></td>
          <td class="text-right">{{ formatNumber(totalScheduledAmount, 2) }}</td>
          <td></td>
          <td class="text-right">{{ formatNumber(totalScheduledReceivedAmount, 2) }}</td>
          <td></td>
          <td></td>
          <td class="text-right">{{ formatNumber(totalScheduledReceivedAdditionalPaymentAmount, 2) }}</td>
          <td></td>
          <td class="text-right">{{ formatNumber(totalScheduledAmount - totalScheduledReceivedAmount - totalScheduledReceivedAdditionalPaymentAmount, 2) }}</td>
          <td></td>
        </tr>
      </tbody>
    </base-table>
  </base-card>
</template>

<style scoped lang="postcss"></style>
