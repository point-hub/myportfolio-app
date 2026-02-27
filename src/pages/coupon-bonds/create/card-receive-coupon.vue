<script setup lang="ts">
import { computed, watchEffect } from 'vue';
import { useRoute } from 'vue-router';

import { type IBankAccountOption,useSelectableBankAccounts } from '@/composables/selectable/bank-accounts';
import { formatDate } from '@/utils/date';
import { roundNumber } from '@/utils/number';

import { type IForm, type IReceivedCoupon } from './form';

const data = defineModel<IForm>('data', {
  default: () => ({
    coupon_tenor: undefined,
    coupon_gross_amount: undefined,
    coupon_rate: undefined,
    coupon_tax_rate: undefined,
    coupon_tax_amount: undefined,
    coupon_net_amount: undefined,
    received_coupons: [],
  }),
});

interface IError {
  received_date: string[]
  received_amount: string[]
  bank_id: string[]
}
const errors = defineModel<IError>('errors', {
  default: () => ({
    received_date: [],
    received_amount: [],
    bank_id: [],
  }),
});

const { options: bankOptions, searchBank } = useSelectableBankAccounts();

const nextCouponDate = computed(() => {
  if (couponIndex.value + 1 >= data.value?.received_coupons.length) {
    return '';
  } else {
    const base = new Date(
      data.value.received_coupons[couponIndex.value + 1]?.date as string,
    );

    return base.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
    });
  }
});

watchEffect(() => {
  data.value.coupon_gross_amount = roundNumber((data.value.principal_amount ?? 0) * (data.value.coupon_rate ?? 0) / (data.value.base_date ?? 0) * (data.value.coupon_tenor ?? 0), 2);
  data.value.coupon_tax_amount = roundNumber((data.value.coupon_tax_rate ?? 0) / 100 * data.value.coupon_gross_amount, 2);
  data.value.coupon_net_amount = data.value.coupon_gross_amount - data.value.coupon_tax_amount;

  data.value.received_coupons?.forEach((el) => {
    el.remaining_amount = el.amount - el.received_amount;
  });
});

const onSelectedBank = (selected: IBankAccountOption, receivedCoupon: IReceivedCoupon) => {
  receivedCoupon.bank_id = selected.bank_id;
};

const isSaving = defineModel('is-saving', { default: false });
const route = useRoute();

const couponIndex = computed(() => {
  const uuid = String(route.params.uuid);

  const index = data.value?.received_coupons?.findIndex(
    (coupon) => coupon.uuid === uuid,
  ) ?? -1;

  return index;
});
</script>

<template>
  <div v-if="data.received_coupons && data.received_coupons.length > 0" class="flex flex-col gap-2">
    <base-card title="Coupon Information">
      <div class="flex flex-col gap-4" >
        <base-datepicker required layout="horizontal" label="Date Received" v-model="data.received_coupons[couponIndex]!.received_date" :errors="errors.received_date" :disabled="isSaving" />
        <base-select
          label="Bank"
          required
          v-model="data.received_coupons[couponIndex]!.bank_account_uuid"
          v-model:search="searchBank"
          :options="bankOptions"
          @select="(selected: IBankAccountOption) => onSelectedBank(selected, data.received_coupons[couponIndex]!)"
          :disabled="isSaving"
          :errors="errors.bank_id"
          placeholder="Select"
        />
        <base-input-number layout="horizontal" label="Coupon Received" align="left" required v-model="data.received_coupons[couponIndex]!.received_amount" :errors="errors.received_amount" :disabled="isSaving" />
        <base-textarea layout="horizontal" label="Notes" :min-height="128" v-model="data.received_coupons[couponIndex]!.notes" :disabled="isSaving" />
      </div>
    </base-card>
    <base-card title="Total Received">
      <div class="flex flex-col gap-4">
        <base-input layout="horizontal" label="Last Update" align="left" :model-value="formatDate(data.received_coupons[couponIndex]!.updated_at)" disabled />
        <base-input-number layout="horizontal" label="Nominal Difference" align="left" :model-value="data.received_coupons[couponIndex]!.remaining_amount" disabled allow-negative />
        <base-input-number layout="horizontal" label="Total Received" align="left" :model-value="data.received_coupons[couponIndex]!.received_amount" disabled />
        <base-input layout="horizontal" label="Next Coupon Date" align="left" :model-value="nextCouponDate" disabled />
      </div>
    </base-card>
  </div>
</template>

<style scoped lang="postcss"></style>
