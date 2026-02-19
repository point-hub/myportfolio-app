<script setup lang="ts">
import { computed, watchEffect } from 'vue';
import { useRoute } from 'vue-router';

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
    received_coupons: [],
  }),
});

const nextCouponDate = computed(() => {
  if (couponIndex.value + 1 >= data.value?.received_coupons.length) {
    return '';
  } else {
    const base = new Date(data.value.received_coupons[couponIndex.value + 1]?.date as string);
    return base.toISOString().slice(0, 10);
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

const route = useRoute();

const couponIndex = computed(() => {
  const uuid = String(route.params.uuid);

  return data.value?.received_coupons?.findIndex(
    (coupon) => coupon.uuid === uuid,
  ) ?? -1;
});

const lastAchievedDate = computed(() => {
  let lastIndex = 0;
  if (couponIndex.value + 1 >= data.value?.received_coupons.length) {
    return '';
  } else if (couponIndex.value < 0) {
    return '';
  } else {
    return data.value.received_coupons[lastIndex]?.received_date;
  }
});
</script>

<template>
  <div v-if="data.received_coupons && data.received_coupons.length > 0" class="flex flex-col gap-2">
    <base-card title="Coupon Information">
      <div class="flex flex-col gap-4" >
        <base-datepicker layout="horizontal" label="Date Received" :model-value="data.received_coupons[couponIndex]!.received_date" disabled />
        <base-input layout="horizontal" label="Bank Placement" :model-value="`[${data.received_coupons[couponIndex]!.bank?.name}] ${data.received_coupons[couponIndex]!.bank?.account?.account_number} a/n ${data.received_coupons[couponIndex]!.bank?.account?.account_name}`" disabled />
        <base-input-number layout="horizontal" label="Coupon Received" align="left" v-model="data.received_coupons[couponIndex]!.received_amount" disabled />
      </div>
    </base-card>
    <base-card title="Total Received">
      <div class="flex flex-col gap-4">
        <base-input layout="horizontal" label="Last Update" align="left" :model-value="lastAchievedDate" disabled />
        <base-input-number layout="horizontal" label="Nominal Difference" align="left" :model-value="data.received_coupons[couponIndex]!.remaining_amount" disabled allow-negative />
        <base-input-number layout="horizontal" label="Total Received" align="left" :model-value="data.received_coupons[couponIndex]!.received_amount" disabled />
        <base-input layout="horizontal" label="Next Coupon Update" align="left" :model-value="nextCouponDate" disabled />
      </div>
    </base-card>
  </div>
</template>

<style scoped lang="postcss"></style>
