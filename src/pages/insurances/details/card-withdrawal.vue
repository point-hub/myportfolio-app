<script setup lang="ts">
import { useSelectableBankAccounts } from '@/composables/selectable/bank-accounts';

import { type IForm } from './form';

const data = defineModel<IForm>('data', {
  default: () => ({
    withdrawal: undefined,
  }),
});

const { getLabel } = useSelectableBankAccounts();
</script>

<template>
  <base-card title="withdrawal" v-if="data.withdrawal?.received_amount">
    <div class="flex flex-col gap-4">
      <base-input layout="h" label="Received Date" disabled :model-value="data.withdrawal.received_date" />
      <base-input
        layout="h"
        label="Bank"
        disabled
        :model-value="getLabel({
          bank_name: data.withdrawal?.bank?.name,
          bank_account_name: data.withdrawal?.bank?.account?.account_name,
          bank_account_number: data.withdrawal?.bank?.account?.account_number
        })"
      />
      <base-input-number layout="h" align="left" label="Amount" disabled :model-value="data.withdrawal.amount" />
      <base-input-number layout="h" align="left" label="Received Amount" disabled :model-value="data.withdrawal.received_amount" />
      <base-input-number layout="h" align="left" label="Remaining Amount" disabled :model-value="data.withdrawal.remaining_amount" />
    </div>
  </base-card>
</template>

<style scoped lang="postcss"></style>
