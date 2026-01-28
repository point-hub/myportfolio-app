<script setup lang="ts">
import { onMounted } from 'vue';

import { retrieveCounterApi } from '@/composables/api/counters/retrieve.api';

import { type IForm, type IFormError } from './form';

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

onMounted(async () => {
  const counter = await retrieveCounterApi('banks');
  data.value.code = counter.value;
});
</script>

<template>
  <base-card>
    <template #header>Banks</template>

    <div class="flex flex-col gap-4 my-5">
      <base-input layout="horizontal" label="Code" required v-model="data.code" :errors="errors.code" :disabled="isSaving" />
      <base-input layout="horizontal" label="Name" required v-model="data.name" :errors="errors.name" :disabled="isSaving" />
      <base-input layout="horizontal" label="Branch"  v-model="data.branch" :errors="errors.branch" :disabled="isSaving" />
      <base-input layout="horizontal" label="Address"  v-model="data.address" :errors="errors.address" :disabled="isSaving" />
      <base-input layout="horizontal" label="Phone"  v-model="data.phone" :errors="errors.phone" :disabled="isSaving" />
      <base-input layout="horizontal" label="Account Number"  v-model="data.account_number" :errors="errors.account_number" :disabled="isSaving" />
      <base-input layout="horizontal" label="Account Name"  v-model="data.account_name" :errors="errors.account_name" :disabled="isSaving" />
    </div>
  </base-card>
</template>

<style scoped lang="postcss"></style>
