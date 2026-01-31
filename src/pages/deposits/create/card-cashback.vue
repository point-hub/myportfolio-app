<script setup lang="ts">
import { computed, ref, watch } from 'vue';

import { useSelectableBankAccounts } from '@/composables/selectable/bank-accounts';
import { toast } from '@/toast';
import { formatNumber } from '@/utils/number';

import { type IForm, type IFormError } from './form';

const data = defineModel<IForm>('data', {
  default: () => ({
    cashback: {
      bank_id: undefined,
      bank_account_uuid: undefined,
    },
  }),
});
const errors = defineModel<IFormError>('errors');
const isSaving = defineModel('is-saving', { default: false });

const { options: bankOptions, searchBank } = useSelectableBankAccounts();

const cashbackPaymentDate = ref();
const cashbackRate = ref();

const cashbackAmount = computed<number>({
  get() {
    const amount = data.value.placement.amount;
    const rate = cashbackRate.value;

    if (!amount || !rate) return 0;

    return amount * (rate / 100);
  },
  set(value: number) {
    const amount = data.value.placement.amount;
    if (!amount) return;
    cashbackRate.value = (value / amount) * 100;
  },
});

const totalScheduledCashback = computed(() =>
  data.value.cashback_schedule.reduce(
    (sum, item) => sum + (item.amount ?? 0),
    0,
  ),
);

const onAddCashback = () => {
  if (!cashbackPaymentDate.value) {
    toast('Payment date is required.', { color: 'danger' });
    return;
  }

  if (!cashbackRate.value || cashbackRate.value <= 0) {
    toast('Cashback rate must be greater than 0.', { color: 'danger' });
    return;
  }

  data.value.cashback_schedule.push({
    payment_date: cashbackPaymentDate.value,
    rate: cashbackRate.value,
    amount: cashbackAmount.value,
  });

  // reset inputs
  cashbackPaymentDate.value = undefined;
  cashbackRate.value = undefined;
};

const onDeleteCashback = (index: number) => {
  data.value.cashback_schedule.splice(index, 1);
};

watch(() => [data.value.cashback.bank_account_uuid, bankOptions.value], () => {
  const selected = bankOptions.value.find(o => o.value === data.value.cashback.bank_account_uuid);
  data.value.cashback.bank_id = selected?.bank_id;
});
</script>

<template>
  <base-card title="Cashback Info">
    <div class="flex flex-col gap-4">
      <div class="flex flex-col gap-4">
        <base-select
          label="Bank Recipient"
          required
          v-model:selectedValue="data.cashback.bank_account_uuid"
          v-model:search="searchBank"
          :options="bankOptions"
          :errors="errors?.[`cashback.bank_id`]"
          :disabled="isSaving"
          placeholder="Select"
          description="Bank where you should receive the cashback"
        />
      </div>
    </div>
  </base-card>
  <base-card title="Cashback Schedule">
    <div class="flex flex-col lg:flex-row lg:items-end gap-1">
      <base-datepicker layout="v" label="Payment Date"  align="left" v-model="cashbackPaymentDate" :disabled="isSaving" />
      <div class="flex items-end gap-1">
        <base-input-number layout="v" label="Rate" align="left" placeholder="Rate" v-model="cashbackRate" :disabled="isSaving" decimal-length="2"/>
        <base-input-number layout="v" label="Amount" align="left" placeholder="Amount" v-model="cashbackAmount" :disabled="isSaving" decimal-length="2" />
      </div>
      <base-button @click="onAddCashback" variant="filled" color="primary">
        <base-icon class="i-fa7-regular:circle-plus" /> Add
      </base-button>
    </div>
    <base-table>
      <thead>
        <tr>
          <th>Payment Date</th>
          <th class="text-right w-1">Rate</th>
          <th class="text-right w-1">Amount</th>
          <th class="w-1"></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(cashbackSchedule, index) in data.cashback_schedule">
          <td>{{ cashbackSchedule.payment_date }}</td>
          <td class="text-right w-1">{{ formatNumber(cashbackSchedule.rate, 2) }}</td>
          <td class="text-right">{{ formatNumber(cashbackSchedule.amount, 2) }}</td>
          <td>
            <base-button @click="onDeleteCashback(index)" variant="filled" color="danger">
              <base-icon class="i-fa7-regular:circle-x" />
            </base-button>
          </td>
        </tr>
        <tr class="font-bold">
          <td colspan="2" class="text-right">TOTAL SCHEDULED CASHBACK</td>
          <td class="text-right">{{ formatNumber(totalScheduledCashback, 2) }}</td>
          <td></td>
        </tr>
      </tbody>
    </base-table>
  </base-card>
</template>

<style scoped lang="postcss"></style>
