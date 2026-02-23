<script setup lang="ts">
import { onMounted } from 'vue';

import { retrieveCounterApi } from '@/composables/api/counters/retrieve.api';

import { type IForm, type IFormError } from './form';

const data = defineModel<IForm>('data', {
  default: () => ({
    form_number: undefined,
    product: undefined,
    publisher: undefined,
    type: undefined,
    series: undefined,
    year_issued: undefined,
  }),
});
const errors = defineModel<IFormError>('errors', {
  default: () => ({
    form_number: [],
    product: [],
    publisher: [],
    type: [],
    series: [],
    year_issued: [],
  }),
});
const isSaving = defineModel('is-saving', { default: false });

onMounted(async () => {
  const counter = await retrieveCounterApi('bonds', new Date());
  data.value.form_number = counter.value;
});
</script>

<template>
  <base-card title="Bonds">
    <div class="flex flex-col gap-4 my-5">
      <base-input layout="horizontal" label="Form Number" required v-model="data.form_number" :errors="errors.form_number" :disabled="isSaving" />
      <base-input layout="horizontal" label="Product" required v-model="data.product" :errors="errors.form_number" :disabled="isSaving" />
      <base-input layout="horizontal" label="Year Issued" required v-model="data.year_issued" :errors="errors.form_number" :disabled="isSaving" />
      <base-input layout="horizontal" label="Publisher" v-model="data.publisher" :errors="errors.form_number" :disabled="isSaving" />
      <base-input layout="horizontal" label="Type" v-model="data.type" :errors="errors.form_number" :disabled="isSaving" />
      <base-input layout="horizontal" label="Series" v-model="data.series" :errors="errors.form_number" :disabled="isSaving" />
    </div>
  </base-card>
</template>

<style scoped lang="postcss"></style>
