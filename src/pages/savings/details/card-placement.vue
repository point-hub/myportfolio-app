<script setup lang="ts">
import { type IForm } from './form';

const data = defineModel<IForm>('data', {
  default: () => ({
    placement: {
      type: undefined,
      bank: undefined,
      account_number: undefined,
      base_date: undefined,
      date: undefined,
      term: undefined,
      maturity_date: undefined,
      amount: undefined,
    },
  }),
});
</script>

<template>
  <base-card title="Placement">
    <div class="flex flex-col gap-4">
      <base-input layout="h" label="Type" disabled :model-value="data.placement?.type" />
      <base-input layout="h" label="Bank" disabled :model-value="data.placement?.bank?.name" />
      <base-input layout="h" label="Account Number" disabled :model-value="data.placement?.account_number" />
      <base-input layout="h" label="Base Date" disabled :model-value="data.placement?.base_date" />
      <base-input layout="h" label="Placement Date" disabled :model-value="data.placement?.date" />
      <base-input layout="h" label="Term" disabled :model-value="data.placement?.term" />
      <base-input layout="h" label="Maturity Date" disabled :model-value="data.placement?.maturity_date" />
      <base-input-number align="left" layout="h" label="Amount" disabled :model-value="data.placement?.amount" />
    </div>
  </base-card>
</template>

<style scoped lang="postcss"></style>
