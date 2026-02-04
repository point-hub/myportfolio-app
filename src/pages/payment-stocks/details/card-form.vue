<script setup lang="ts">
import { onMounted } from 'vue';

import { retrieveCounterApi } from '@/composables/api/counters/retrieve.api';

import { type IForm, type IFormError } from './form';

const data = defineModel<IForm>('data', {
  default: () => ({
    form_number: undefined,
    payment_date: undefined,
    broker_id: undefined,
  }),
});
const errors = defineModel<IFormError>('errors', {
  default: () => ({
    form_number: [],
    payment_date: [],
    broker_id: [],
  }),
});

onMounted(async () => {
  const counter = await retrieveCounterApi('payment_stocks', new Date());
  data.value.form_number = counter.value;
});
</script>

<template>
  <base-card title="Payment Stocks">
    <div class="flex flex-col gap-4 my-5">
      <base-input layout="horizontal" label="Form Number" :model-value="data.form_number" disabled />
      <base-input layout="horizontal" label="Broker" :model-value="data.broker?.name ?? ''" disabled />
      <base-datepicker layout="h" label="Payment Date" :model-value="data.payment_date" :errors="errors['payment_date']" disabled />
    </div>
  </base-card>
</template>

<style scoped lang="postcss"></style>
