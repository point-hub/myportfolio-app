<script setup lang="ts">
import { onMounted } from 'vue';

import { retrieveCounterApi } from '@/composables/api/counters/retrieve.api';

import { type IForm } from './form';

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

onMounted(async () => {
  const counter = await retrieveCounterApi('bonds', new Date());
  data.value.form_number = counter.value;
});
</script>

<template>
  <base-card title="Bonds">
    <div class="flex flex-col gap-4 my-5">
      <base-input layout="horizontal" label="Form Number" :model-value="data.form_number" disabled />
      <base-input layout="horizontal" label="Product" :model-value="data.product" disabled />
      <base-input layout="horizontal" label="Year Issued" :model-value="data.year_issued" disabled />
      <base-input layout="horizontal" label="Publisher" :model-value="data.publisher" disabled />
      <base-input layout="horizontal" label="Type" :model-value="data.type" disabled />
      <base-input layout="horizontal" label="Series" :model-value="data.series" disabled />
    </div>
  </base-card>
</template>

<style scoped lang="postcss"></style>
