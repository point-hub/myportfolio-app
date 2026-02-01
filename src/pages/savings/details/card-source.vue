<script setup lang="ts">
import { useSelectableBankAccounts } from '@/composables/selectable/bank-accounts';

import { type IForm } from './form';

const data = defineModel<IForm>('data', {
  default: () => ({
    source: {
      bank: undefined,
    },
  }),
});

const { getLabel } = useSelectableBankAccounts();
</script>

<template>
  <base-card title="Source of Fund">
    <div class="flex flex-col gap-4">
      <base-input
        layout="h"
        label="Bank"
        disabled
        :model-value="getLabel({
          bank_name: data.source?.bank?.name,
          bank_account_name: data.source?.bank?.account?.account_name,
          bank_account_number: data.source?.bank?.account?.account_number
        })"
      />
    </div>
  </base-card>
</template>

<style scoped lang="postcss"></style>
