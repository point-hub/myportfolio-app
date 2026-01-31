<script setup lang="ts">
import { computed } from 'vue';

import { useSelectableBankAccounts } from '@/composables/selectable/bank-accounts';
import { formatNumber, roundNumber } from '@/utils/number';

import { type IForm } from './form';

const data = defineModel<IForm>('data', {
  default: () => ({
    interest: {
      payment_method: undefined,
      rate: undefined,
      gross_amount: undefined,
      tax_rate: undefined,
      tax_amount: undefined,
      net_amount: undefined,
      bank: undefined,
      is_rollover: false,
    },
    interest_schedule: [],
  }),
});

const totalScheduledAmount = computed(() => {
  if (!data.value.interest_schedule?.length) return 0;

  const total = data.value.interest_schedule.reduce((sum, item) => {
    const amount = item.amount ?? 0;
    return sum + amount;
  }, 0);
  return roundNumber(total);
});

const totalScheduledReceivedAmount = computed(() => {
  if (!data.value.interest_schedule?.length) return 0;

  const total = data.value.interest_schedule.reduce((sum, item) => {
    const amount = item.received_amount ?? 0;
    return sum + amount;
  }, 0);
  return roundNumber(total);
});

const totalScheduledReceivedAdditionalPaymentAmount = computed(() => {
  if (!data.value.interest_schedule?.length) return 0;

  const total = data.value.interest_schedule.reduce((sum, item) => {
    const amount = item.received_additional_payment_amount ?? 0;
    return sum + amount;
  }, 0);
  return roundNumber(total);
});

const totalScheduledTerm = computed(() => {
  if (!data.value.interest_schedule?.length) return 0;

  const total = data.value.interest_schedule.reduce((sum, item) => {
    const term = item.term ?? 0;
    return sum + term;
  }, 0);
  return roundNumber(total, 2);
});

const { getLabel } = useSelectableBankAccounts();
</script>

<template>
  <base-card title="Interest Info">
    <div class="flex flex-col gap-4">
      <base-input
        layout="h"
        label="Bank"
        disabled
        :model-value="getLabel({
          bank_name: data.interest?.bank?.name,
          bank_account_name: data.interest?.bank?.account?.account_name,
          bank_account_number: data.interest?.bank?.account?.account_number
        })"
      />
      <base-input-number layout="h" label="Rate" align="left" :model-value="data.interest?.rate" disabled decimal-length="2" />
      <base-input-number layout="h" label="Gross Amount" align="left" :model-value="data.interest?.gross_amount" disabled decimal-length="2" />
      <base-input-number layout="h" label="Tax Rate" align="left" :model-value="data.interest?.tax_rate" disabled decimal-length="2" />
      <base-input-number layout="h" label="Tax Amount" align="left" :model-value="data.interest?.tax_amount" disabled decimal-length="2" />
      <base-input-number layout="h" label="Net Amount" align="left" :model-value="data.interest?.net_amount" disabled decimal-length="2" />
      <base-checkbox layout="h" label="Interest Rollover" :model-value="data.interest?.is_rollover" disabled />
    </div>
  </base-card>
  <base-card v-if="!data.interest?.is_rollover" title="Interest Schedule">
    <base-table v-if="data.interest_schedule?.length">
      <thead>
        <tr>
          <th colspan="3"></th>
          <th colspan="3" class="border-x border-slate-200 bg-slate-50 dark:bg-slate-700 dark:text-white text-center">Received</th>
          <th colspan="3" class="border-x border-slate-200 bg-slate-50 dark:bg-slate-700 dark:text-white text-center">Received Additional Payment</th>
          <th class="w-1"></th>
        </tr>
        <tr>
          <th class="whitespace-nowrap">Payment Date</th>
          <th class="text-right w-1">Term</th>
          <th class="text-right w-1">Amount</th>
          <th class="text-right w-1">Date</th>
          <th class="text-right w-1">Amount</th>
          <th class="w-1">Bank</th>
          <th class="text-right w-1">Date</th>
          <th class="text-right w-1">Amount</th>
          <th class="w-1">Bank</th>
          <th class="text-right w-1">Remaining</th>
          <th class="text-right whitespace-nowrap w-1">Created By</th>
          <th class="w-1"></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(interestSchedule, index) in data.interest_schedule">
          <td class="whitespace-nowrap">{{ interestSchedule?.payment_date }}</td>
          <td class="text-right">{{ interestSchedule?.term }}</td>
          <td class="text-right">{{ formatNumber(interestSchedule.amount, 2) }}</td>
          <td class="text-right whitespace-nowrap">{{ interestSchedule?.received_date }}</td>
          <td class="text-right">{{ formatNumber(interestSchedule.received_amount ?? 0, 2) }}</td>
          <td class="whitespace-nowrap">
            {{
              getLabel({
                bank_name: interestSchedule.bank?.name,
                bank_account_name: interestSchedule.bank?.account?.account_name,
                bank_account_number: interestSchedule.bank?.account?.account_number,
              })
            }}
          </td>
          <td class="text-right whitespace-nowrap">{{ interestSchedule?.received_additional_payment_date }}</td>
          <td class="text-right">{{ formatNumber(interestSchedule.received_additional_payment_amount ?? 0, 2) }}</td>
          <td class="whitespace-nowrap">
            {{
              getLabel({
                bank_name: interestSchedule.additional_bank?.name,
                bank_account_name: interestSchedule.additional_bank?.account?.account_name,
                bank_account_number: interestSchedule.additional_bank?.account?.account_number,
              })
            }}
          </td>
          <td class="text-right">{{ formatNumber((interestSchedule?.amount ?? 0) - (interestSchedule.received_amount ?? 0) - (interestSchedule.received_additional_payment_amount ?? 0), 2) }}</td>
          <td class="text-right">{{ interestSchedule.created_by?.username }}</td>
        </tr>
        <tr class="font-bold">
          <td class="text-right"></td>
          <td class="text-right">{{ formatNumber(totalScheduledTerm) }}</td>
          <td class="text-right">{{ formatNumber(totalScheduledAmount, 2) }}</td>
          <td class="text-right"></td>
          <td class="text-right">{{ formatNumber(totalScheduledReceivedAmount, 2) }}</td>
          <td class="text-right"></td>
          <td class="text-right"></td>
          <td class="text-right"></td>
          <td class="text-right"></td>
          <td class="text-right">{{ formatNumber(totalScheduledAmount - totalScheduledReceivedAmount - totalScheduledReceivedAdditionalPaymentAmount, 2) }}</td>
          <td class="text-right"></td>
          <td></td>
        </tr>
      </tbody>
    </base-table>
  </base-card>
</template>

<style scoped lang="postcss"></style>
