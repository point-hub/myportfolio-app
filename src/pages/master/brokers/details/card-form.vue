<script setup lang="ts">
import { type IForm } from './form';

const data = defineModel<IForm>('data', {
  default: () => ({
    code: undefined,
    name: undefined,
    branch: undefined,
    address: undefined,
    phone: undefined,
    notes: undefined,
  }),
});
</script>

<template>
  <base-card title="Broker">
    <div class="flex flex-col gap-4">
      <base-input layout="horizontal" label="Code" readonly v-model="data.code" border="full" />
      <base-input layout="horizontal" label="Name" readonly v-model="data.name" border="full" />
      <base-input layout="horizontal" label="Branch" readonly v-model="data.branch" border="full" />
      <base-input layout="horizontal" label="Address" readonly v-model="data.address" border="full" />
      <base-input layout="horizontal" label="Phone" readonly v-model="data.phone" border="full" />
    </div>
  </base-card>
</template>

<style scoped lang="postcss"></style>
