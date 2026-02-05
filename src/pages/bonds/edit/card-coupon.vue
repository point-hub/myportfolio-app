<script setup lang="ts">
import { computed, watchEffect } from 'vue';

import { roundNumber } from '@/utils/number';

import { type IForm } from './form';

const data = defineModel<IForm>('data', {
  default: () => ({
    coupon_tenor: undefined,
    coupon_gross_amount: undefined,
    coupon_rate: undefined,
    coupon_tax_rate: undefined,
    coupon_tax_amount: undefined,
    coupon_net_amount: undefined,
    received_coupons: {
      date: undefined,
      amount: undefined,
      bank_id: undefined,
      bank_account_uuid: undefined,
    },
  }),
});

const nextCouponDate = computed(() => {
  if (!data.value.maturity_date) { return; }

  const base = new Date(data.value.maturity_date as string);
  base.setDate(base.getDate() + Number(data.value.coupon_tenor ?? 0));

  const yyyy = base.getFullYear();
  const mm = String(base.getMonth() + 1).padStart(2, '0');
  const dd = String(base.getDate()).padStart(2, '0');

  return `${yyyy}-${mm}-${dd}`;
});

watchEffect(() => {
  data.value.coupon_gross_amount = roundNumber((data.value.principal_amount ?? 0) * (data.value.coupon_rate ?? 0) / (data.value.base_date ?? 0) * (data.value.coupon_tenor ?? 0), 2);
  data.value.coupon_tax_amount = roundNumber((data.value.coupon_tax_rate ?? 0) / 100 * data.value.coupon_gross_amount, 2);
  data.value.coupon_net_amount = data.value.coupon_gross_amount - data.value.coupon_tax_amount;
  data.value.coupon_date = nextCouponDate.value;
});

</script>

<template>
  <base-card title="Coupon Information">
    <div class="flex flex-col gap-4">
      <base-input-number layout="horizontal" label="Coupon Tenor" align="left" :model-value="data.coupon_tenor" disabled />
      <base-input-number layout="horizontal" label="Gross Coupon" align="left" :model-value="data.coupon_gross_amount" disabled />
      <base-input-number layout="horizontal" label="Tax Rate" align="left" :model-value="data.coupon_tax_rate" disabled />
      <base-input-number layout="horizontal" label="Tax Amount" align="left" :model-value="data.coupon_tax_amount" disabled />
      <base-input-number layout="horizontal" label="Net Amount" align="left" :model-value="data.coupon_net_amount" disabled />
      <base-input layout="horizontal" label="Next Coupon Date" align="left" :model-value="nextCouponDate" disabled />
    </div>
  </base-card>
</template>

<style scoped lang="postcss"></style>
