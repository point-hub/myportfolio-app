<script setup lang="ts">
import type { IForm, IFormError } from './form';

const data = defineModel<IForm>('data', {
  default: () => ({
    code: undefined,
    name: undefined,
    branch: undefined,
    address: undefined,
    phone: undefined,
    account_number: undefined,
    account_name: undefined,
  }),
});
const errors = defineModel<IFormError>('errors', {
  default: () => ({
    code: [],
    name: [],
    branch: [],
    address: [],
    phone: [],
    account_number: [],
    account_name: [],
  }),
});
const isSaving = defineModel('is-saving', { default: false });
</script>

<template>
  <base-card title="Banks">
    <div class="flex flex-col gap-4 my-5">
      <base-input layout="horizontal" label="Code" required v-model="data.code" :errors="errors.code" :disabled="isSaving" />
      <base-input layout="horizontal" label="Name" required v-model="data.name" :errors="errors.name" :disabled="isSaving" />
      <base-input layout="horizontal" label="Branch" required v-model="data.branch" :errors="errors.branch" :disabled="isSaving" />
      <base-input layout="horizontal" label="Address" required v-model="data.address" :errors="errors.address" :disabled="isSaving" />
      <base-input layout="horizontal" label="Phone" required v-model="data.phone" :errors="errors.phone" :disabled="isSaving" />
      <base-input layout="horizontal" label="Account Number" required v-model="data.account_number" :errors="errors.account_number" :disabled="isSaving" />
      <base-input layout="horizontal" label="Account Name" required v-model="data.account_name" :errors="errors.account_name" :disabled="isSaving" />
    </div>
  </base-card>
</template>

<style scoped lang="postcss"></style>
