<script setup lang="ts">
import { useSelectableBrokers } from '@/composables/selectable/brokers';
import { useSelectableOwners } from '@/composables/selectable/owners';

import { type IForm } from './form';

const data = defineModel<IForm>('data', {
  default: () => ({
    form_number: undefined,
    transaction_date: undefined,
    settlement_date: undefined,
    broker_id: undefined,
    transaction_number: undefined,
    owner_id: undefined,
  }),
});
const { options: ownerOptions, searchOwner } = useSelectableOwners();
const { options: brokerOptions, searchBroker } = useSelectableBrokers();
</script>

<template>
  <base-card title="Stocks">
    <div class="flex flex-col gap-4 my-5">
      <base-input layout="horizontal" label="Form Number" required v-model="data.form_number" disabled />
      <base-datepicker layout="h" label="Transaction Date" required v-model="data.transaction_date" disabled />
      <base-datepicker layout="h" label="Settlement Date" required v-model="data.settlement_date" disabled />
      <base-select
        label="Broker"
        required
        v-model="data.broker_id"
        v-model:search="searchBroker"
        :options="brokerOptions"
        disabled
        placeholder="Select"
      />
      <base-input layout="horizontal" label="Transaction Number" required v-model="data.transaction_number" disabled />
      <base-select
        label="Owner"
        required
        v-model="data.owner_id"
        v-model:search="searchOwner"
        :options="ownerOptions"
        disabled
        placeholder="Select"
      />
    </div>
  </base-card>
</template>

<style scoped lang="postcss"></style>
