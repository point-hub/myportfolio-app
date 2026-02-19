<script setup lang="ts">
import { onMounted, watchEffect } from 'vue';

import { retrieveCounterApi } from '@/composables/api/counters/retrieve.api';

import { type IForm } from './form';

const data = defineModel<IForm>('data', {
  default: () => ({
    bank_source_id: undefined,
    bank_source_account_uuid: undefined,
    bank_placement_id: undefined,
    bank_placement_account_uuid: undefined,
    owner_id: undefined,
    base_date: undefined,
    transaction_date: undefined,
    settlement_date: undefined,
    maturity_date: undefined,
    transaction_number: undefined,
    price: undefined,
    principal_amount: undefined,
    proceed_amount: undefined,
    accrued_interest: undefined,
    total_proceed: undefined,
    coupon_rate: undefined,
    coupon_tenor: undefined,
    coupon_tax_rate: undefined,
  }),
});

watchEffect(() => {
  data.value.proceed_amount = (data.value.principal_amount ?? 0) * (data.value.price ?? 0) / 100;
  data.value.total_proceed = data.value.proceed_amount + (data.value.accrued_interest ?? 0);
});

onMounted(async () => {
  const counter = await retrieveCounterApi('bonds', new Date());
  data.value.form_number = counter.value;
});
</script>

<template>
  <base-card title="Buy Information">
    <div class="flex flex-col gap-4 my-5">
      <base-input layout="horizontal" label="Bank Source" :model-value="`[${data.bank_source?.name}] ${data.bank_source?.account?.account_number} a/n ${data.bank_source?.account?.account_name}`" disabled />
      <base-input layout="horizontal" label="Bank Placement" :model-value="`[${data.bank_placement?.name}] ${data.bank_placement?.account?.account_number} a/n ${data.bank_placement?.account?.account_name}`" disabled />
      <base-input layout="horizontal" label="Owner" :model-value="data.owner?.name" disabled />

      <base-input-number layout="horizontal" label="Base Date" align="left" v-model="data.base_date" disabled />
      <base-datepicker layout="horizontal" label="Transaction Date" v-model="data.transaction_date" disabled />
      <base-datepicker layout="horizontal" label="Settlement Date" v-model="data.settlement_date" disabled />
      <base-datepicker layout="horizontal" label="Maturity Date" v-model="data.maturity_date" disabled />
      <base-input layout="horizontal" label="Transaction Number" v-model="data.transaction_number" disabled />

      <base-input-number layout="horizontal" label="Price" align="left" v-model="data.price" disabled />
      <base-input-number layout="horizontal" label="Principal Amount" align="left" v-model="data.principal_amount" disabled />
      <base-input-number layout="horizontal" label="Proceed Amount" align="left" v-model="data.proceed_amount" disabled />
      <base-input-number layout="horizontal" label="Accrued Interest" align="left" v-model="data.accrued_interest" disabled />
      <base-input-number layout="horizontal" label="Total Proceed" align="left" v-model="data.total_proceed" disabled />

      <base-input-number layout="horizontal" label="Coupon Rate" align="left" v-model="data.coupon_rate" disabled />
      <base-input-number layout="horizontal" label="Coupon Tenor" align="left" v-model="data.coupon_tenor" disabled />
      <base-input-number layout="horizontal" label="Coupon Tax Rate" align="left" v-model="data.coupon_tax_rate" disabled />
    </div>
  </base-card>
</template>

<style scoped lang="postcss"></style>
