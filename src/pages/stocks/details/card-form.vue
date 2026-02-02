<script setup lang="ts">
import { useSelectableBrokers } from '@/composables/selectable/brokers';
import { useSelectableOwners } from '@/composables/selectable/owners';

import { type IForm, type IFormError } from './form';

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
const errors = defineModel<IFormError>('errors', {
  default: () => ({
    form_number: [],
    transaction_date: [],
    settlement_date: [],
    broker_id: [],
    transaction_number: [],
    owner_id: [],
  }),
});
const isSaving = defineModel('is-saving', { default: false });

const { options: ownerOptions, searchOwner } = useSelectableOwners();
const { options: brokerOptions, searchBroker } = useSelectableBrokers();
</script>

<template>
  <base-card title="Stocks">
    <div class="flex flex-col gap-4 my-5">
      <base-input layout="horizontal" label="Form Number" required v-model="data.form_number" :errors="errors.form_number" disabled />
      <base-datepicker layout="h" label="Transaction Date" required v-model="data.transaction_date" :errors="errors['transaction_date']" :disabled="isSaving" />
      <base-datepicker layout="h" label="Settlement Date" required v-model="data.settlement_date" :errors="errors['settlement_date']" :disabled="isSaving" />
      <base-select
        label="Broker"
        required
        v-model:selectedValue="data.broker_id"
        v-model:search="searchBroker"
        :options="brokerOptions"
        :errors="errors.broker_id"
        :disabled="isSaving"
        placeholder="Select"
      />
      <base-input layout="horizontal" label="Transaction Number" required v-model="data.transaction_number" :errors="errors.transaction_number" :disabled="isSaving" />
      <base-select
        label="Owner"
        required
        v-model:selectedValue="data.owner_id"
        v-model:search="searchOwner"
        :options="ownerOptions"
        :errors="errors.owner_id"
        :disabled="isSaving"
        placeholder="Select"
      />
    </div>
  </base-card>
</template>

<style scoped lang="postcss"></style>
