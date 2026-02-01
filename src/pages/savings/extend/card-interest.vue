<script setup lang="ts">
import { computed, ref, watch, watchEffect } from 'vue';

import { useSelectableBankAccounts } from '@/composables/selectable/bank-accounts';
import { useSelectableInterestPaymentMethod } from '@/composables/selectable/interest-payment-method';
import { toast } from '@/toast';
import { formatNumber, roundNumber } from '@/utils/number';

import { type IForm, type IFormError } from './form';

const data = defineModel<IForm>('data', {
  default: () => ({
    interest: {
      payment_method: undefined,
      rate: undefined,
      gross_amount: undefined,
      tax_rate: undefined,
      tax_amount: undefined,
      net_amount: undefined,
      bank_id: undefined,
      bank_account_uuid: undefined,
      is_rollover: false,
    },
    interest_schedule: [],
  }),
});
const errors = defineModel<IFormError>('errors', {
  default: () => ({
    'interest.is_rollover': [],
    'interest.payment_method': [],
    'interest.rate': [],
    'interest.gross_amount': [],
    'interest.tax_rate': [],
    'interest.tax_amount': [],
    'interest.net_amount': [],
    'interest.bank_id': [],
    'interest.bank_account_uuid': [],
  }),
});
const isSaving = defineModel('is-saving', { default: false });

const { options: bankOptions, searchBank } = useSelectableBankAccounts();
const { options: paymentMethodOptions } = useSelectableInterestPaymentMethod();

const interestTerm = ref();
const interestPaymentDate = computed(() => {
  const placementDate = data.value?.placement?.date;
  const term = Number(interestTerm.value);

  if (!placementDate || !term) return '';

  let base: Date;

  // Use last scheduled payment date if exists
  const schedules = data.value?.interest_schedule ?? [];
  if (schedules.length > 0) {
    const lastDateStr = schedules[schedules.length - 1]?.payment_date;
    base = lastDateStr ? new Date(lastDateStr) : new Date(placementDate);
  } else {
    base = new Date(placementDate);
  }

  base.setDate(base.getDate() + term);

  return base.toISOString().slice(0, 10);
});

const interestAmount = computed(() => {
  if (!netAmount.value || !data.value.placement.term) {
    return undefined;
  }

  return roundNumber(netAmount.value * interestTerm.value / data.value.placement.term, 2);
});

const grossAmount = computed(() => {
  const { amount, base_date, term } = data.value.placement;
  const { rate } = data.value.interest;
  if (!amount || !base_date || !term || !rate) return undefined;
  return roundNumber(amount * (rate / 100) / base_date * term, 2);
});

const taxAmount = computed(() => {
  return roundNumber((grossAmount.value ?? 0) * ((data.value.interest.tax_rate ?? 0) / 100), 2);
});

const netAmount = computed(() => {
  return roundNumber((grossAmount.value ?? 0) - taxAmount.value, 2);
});

const totalScheduledAmount = computed(() => {
  if (!data.value.interest_schedule?.length) return 0;

  const total = data.value.interest_schedule.reduce((sum, item) => {
    const amount = item.amount ?? 0;
    return sum + amount;
  }, 0);
  return roundNumber(total, 2);
});

const totalScheduledTerm = computed(() => {
  if (!data.value.interest_schedule?.length) return 0;

  const total = data.value.interest_schedule.reduce((sum, item) => {
    const term = item.term ?? 0;
    return sum + term;
  }, 0);
  return roundNumber(total, 2);
});

// Persist computed values in data
watchEffect(() => {
  data.value.interest.gross_amount = grossAmount.value;
  data.value.interest.tax_amount = taxAmount.value;
  data.value.interest.net_amount = netAmount.value;
});

const onAddSchedule = () => {
  const term = Number(interestTerm.value);
  const placementTerm = Number(data.value.placement.term);
  const amount = Number(interestAmount.value);
  const net = Number(netAmount.value);
  const totalAmountAfterAdd = totalScheduledAmount.value + amount;
  const totalTermAfterAdd = data.value.interest_schedule.reduce((sum, item) => sum + Number(item.term || 0), 0) + term;

  // Term cannot exceed placement term
  if (totalTermAfterAdd > placementTerm) {
    toast(`Term cannot exceed placement term (${placementTerm} days).`, { color: 'danger' });
    return;
  }

  // Any rounding discrepancy will be adjusted in the final payment
  let diff = 0;
  if (totalTermAfterAdd === placementTerm) {
    if (totalAmountAfterAdd - net !== 0) {
      diff = roundNumber(totalAmountAfterAdd - net, 2);
    }
  }

  data.value.interest_schedule.push({
    term: interestTerm.value,
    payment_date: interestPaymentDate.value,
    amount: amount - diff,
  });
};

const onDeleteSchedule = (index: number) => {
  if (!data.value?.interest_schedule?.length) return;

  data.value.interest_schedule.splice(index, 1);
};

watch(() => [data.value.interest.bank_account_uuid, bankOptions.value], () => {
  const selected = bankOptions.value.find(o => o.value === data.value.interest.bank_account_uuid);
  data.value.interest.bank_id = selected?.bank_id;
});
</script>

<template>
  <base-card title="Interest Info">
    <div class="flex flex-col gap-4">
      <base-select
        label="Payment Method"
        required
        v-model:selectedValue="data.interest.payment_method"
        :options="paymentMethodOptions"
        :errors="errors['interest.payment_method']"
        :disabled="isSaving"
        placeholder="Select"
      />
      <base-input-number layout="h" label="Rate" align="left" required v-model="data.interest.rate" :errors="errors['interest.rate']" :disabled="isSaving" decimal-length="2" />
      <base-input-number layout="h" label="Gross Amount" align="left" required :model-value="grossAmount" :errors="errors['interest.gross_amount']" disabled decimal-length="2" />
      <base-input-number layout="h" label="Tax Rate" align="left" required v-model="data.interest.tax_rate" :errors="errors['interest.tax_rate']" :disabled="isSaving" decimal-length="2" />
      <base-input-number layout="h" label="Tax Amount" align="left" required :model-value="taxAmount" :errors="errors['interest.tax_amount']" disabled decimal-length="2" />
      <base-input-number layout="h" label="Net Amount" align="left" required :model-value="netAmount" :errors="errors['interest.net_amount']" disabled decimal-length="2" />
      <base-select
        label="Bank Recipient"
        required
        v-model:selectedValue="data.interest.bank_account_uuid"
        v-model:search="searchBank"
        :options="bankOptions"
        :errors="errors['interest.bank_id']"
        :disabled="isSaving"
        placeholder="Select"
        description="Bank where you should receive the interest"
      />
      <base-checkbox layout="h" label="Interest Rollover" v-model="data.interest.is_rollover" :errors="errors['interest.is_rollover']" :disabled="isSaving" />
    </div>
  </base-card>
  <base-card v-if="!data.interest.is_rollover" title="Interest Schedule">
    <div class="flex flex-col lg:flex-row lg:items-end gap-1">
      <div class="flex items-end gap-1">
        <base-input-number layout="v" label="Term" align="left" placeholder="Term" v-model="interestTerm" :disabled="isSaving" decimal-length="2" />
        <base-datepicker layout="v" label="Payment Date" align="left" :model-value="interestPaymentDate" disabled />
      </div>
      <base-input-number layout="v" label="Amount" align="left" placeholder="Amount" :model-value="interestAmount" disabled decimal-length="2" />
      <base-button variant="filled" color="primary" @click="onAddSchedule">
        <base-icon class="i-fa7-regular:circle-plus" /> Add
      </base-button>
    </div>
    <base-table v-if="data.interest_schedule?.length">
      <thead>
        <tr>
          <th>Payment Date</th>
          <th class="text-right w-1">Term</th>
          <th class="text-right w-1">Amount</th>
          <th class="text-right whitespace-nowrap w-1">Received Date</th>
          <th class="w-1"></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(interestSchedule, index) in data.interest_schedule">
          <td>{{ interestSchedule.payment_date }}</td>
          <td class="text-right">{{ interestSchedule.term }}</td>
          <td class="text-right whitespace-nowrap">{{ formatNumber(interestSchedule.amount, 2) }}</td>
          <td class="text-right whitespace-nowrap">{{ interestSchedule.received_date }}</td>
          <td>
            <base-button v-if="(index + 1) === data.interest_schedule.length" @click="onDeleteSchedule(index)" variant="filled" color="danger" :disabled="isSaving">
              <base-icon class="i-fa7-regular:circle-x" />
            </base-button>
          </td>
        </tr>
        <tr class="font-bold">
          <td class="text-right">TOTAL SCHEDULED PAYMENT</td>
          <td class="text-right">{{ formatNumber(totalScheduledTerm) }}</td>
          <td class="text-right">{{ formatNumber(totalScheduledAmount, 2) }}</td>
          <td></td>
        </tr>
        <tr class="font-bold">
          <td class="text-right">TOTAL PAYMENT</td>
          <td class="text-right">{{ formatNumber(data.placement.term) }}</td>
          <td class="text-right">{{ formatNumber(netAmount, 2) }}</td>
          <td></td>
        </tr>
        <tr class="font-bold">
          <td class="text-right">REMAINING</td>
          <td class="text-right">{{ formatNumber((data.placement.term ?? 0) - totalScheduledTerm) }}</td>
          <td class="text-right">{{ formatNumber((netAmount ?? 0) - totalScheduledAmount, 2) }}</td>
          <td></td>
        </tr>
      </tbody>
    </base-table>
  </base-card>
</template>

<style scoped lang="postcss"></style>
