<script setup lang="ts">
import { onMounted } from 'vue';

import { retrieveCounterApi } from '@/composables/api/counters/retrieve.api';
import { useSelectableBrokers } from '@/composables/selectable/brokers';

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
const isSaving = defineModel('is-saving', { default: false });
const { options: brokerOptions, searchBroker } = useSelectableBrokers();

onMounted(async () => {
  const counter = await retrieveCounterApi('payment_stocks', new Date());
  data.value.form_number = counter.value;
});
</script>

<template>
  <base-card title="Payment Stocks">
    <div class="flex flex-col gap-4 my-5">
      <base-input layout="horizontal" label="Form Number" required v-model="data.form_number" :errors="errors.form_number" disabled />
      <base-select
        label="Broker"
        required
        v-model="data.broker_id"
        v-model:search="searchBroker"
        :options="brokerOptions"
        :errors="errors.broker_id"
        :disabled="isSaving"
        placeholder="Select"
      />
      <base-datepicker layout="h" label="Payment Date" required v-model="data.payment_date" :errors="errors['payment_date']" :disabled="isSaving" />
    </div>
  </base-card>
</template>

<style scoped lang="postcss"></style>
