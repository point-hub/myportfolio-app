<script setup lang="ts">
import { onMounted, watch } from 'vue';

import { retrieveCounterApi } from '@/composables/api/counters/retrieve.api';
import { useSelectableBankAccounts } from '@/composables/selectable/bank-accounts';
import { useSelectableBrokers } from '@/composables/selectable/brokers';

import { type IForm, type IFormError } from './form';

const data = defineModel<IForm>('data', {
  default: () => ({
    form_number: undefined,
    dividend_date: undefined,
    broker_id: undefined,
    bank_id: undefined,
    bank_account_uuid: undefined,
  }),
});
const errors = defineModel<IFormError>('errors', {
  default: () => ({
    form_number: [],
    dividend_date: [],
    broker_id: [],
    bank_id: [],
    bank_account_uuid: [],
  }),
});
const { options: brokerOptions, searchBroker } = useSelectableBrokers();

onMounted(async () => {
  const counter = await retrieveCounterApi('dividend_stocks', new Date());
  data.value.form_number = counter.value;
});

const { options: bankOptions, searchBank } = useSelectableBankAccounts();

watch(() => [data.value.bank_account_uuid, bankOptions.value], () => {
  const selected = bankOptions.value.find(o => o.value === data.value.bank_account_uuid);
  data.value.bank_id = selected?.bank_id;
});
</script>

<template>
  <base-card title="Dividend Stocks">
    <div class="flex flex-col gap-4 my-5">
      <base-input layout="horizontal" label="Form Number" required v-model="data.form_number" :errors="errors.form_number" disabled />
      <base-datepicker layout="h" label="Dividend Date" required v-model="data.dividend_date" :errors="errors['dividend_date']" disabled />
      <base-select
        label="Broker"
        required
        v-model="data.broker_id"
        v-model:search="searchBroker"
        :options="brokerOptions"
        :errors="errors.broker_id"
        disabled
        placeholder="Select"
      />
      <base-select
        label="Bank Receival"
        required
        v-model="data.bank_account_uuid"
        v-model:search="searchBank"
        :options="bankOptions"
        :errors="errors['bank_id']"
        disabled
        placeholder="Select"
      />
    </div>
  </base-card>
</template>

<style scoped lang="postcss"></style>
