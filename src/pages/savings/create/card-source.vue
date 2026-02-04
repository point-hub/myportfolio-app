<script setup lang="ts">
import { watch } from 'vue';

import { useSelectableBankAccounts } from '@/composables/selectable/bank-accounts';

import { type IForm, type IFormError } from './form';

const data = defineModel<IForm>('data', {
  default: () => ({
    source: {
      bank_id: undefined,
      bank_account_uuid: undefined,
    },
  }),
});
const errors = defineModel<IFormError>('errors', {
  default: () => ({
    'source.bank_id': [],
  }),
});
const isSaving = defineModel('is-saving', { default: false });

const { options: bankOptions, searchBank } = useSelectableBankAccounts();

watch(() => [data.value.source.bank_account_uuid, bankOptions.value], () => {
  const selected = bankOptions.value.find(o => o.value === data.value.source.bank_account_uuid);
  data.value.source.bank_id = selected?.bank_id;
});
</script>

<template>
  <base-card title="Source of Fund">
    <div class="flex flex-col gap-4 my-5">
      <base-select
        label="Bank"
        required
        v-model="data.source.bank_account_uuid"
        v-model:search="searchBank"
        :options="bankOptions"
        :errors="errors['source.bank_id']"
        :disabled="isSaving"
        placeholder="Select"
        description="Source of funds for the saving placement."
      />
    </div>
  </base-card>
</template>

<style scoped lang="postcss"></style>
