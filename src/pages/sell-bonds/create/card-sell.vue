<script setup lang="ts">
import { watchEffect } from 'vue';

import { type IBankAccountOption, useSelectableBankAccounts } from '@/composables/selectable/bank-accounts';
import { roundNumber } from '@/utils/number';

import { type IForm, type IFormError } from './form';

const data = defineModel<IForm>('data', {
  default: () => ({
    disbursement_date: undefined,
    disbursement_bank_id: undefined,
    disbursement_bank_account_uuid: undefined,
    disbursement_amount: undefined,
    disbursement_amount_received: undefined,
    disbursement_amount_remaining: undefined,
    disbursement_notes: undefined,
    selling_price: undefined,
    remaining_amount: undefined,
  }),
});

const errors = defineModel<IFormError>('errors');

const isSaving = defineModel('is-saving', { default: false });

const { options: bankOptions, searchBank } = useSelectableBankAccounts();

watchEffect(() => {
  data.value.remaining_amount = roundNumber((data.value.principal_amount ?? 0) - (data.value.disbursement_amount ?? 0), 2);
  data.value.disbursement_amount_remaining = roundNumber((data.value.disbursement_amount ?? 0) - (data.value.disbursement_amount_received ?? 0), 2);
});

const onSelectedBank = (selected: IBankAccountOption) => {
  data.value.disbursement_bank_id = selected.bank_id;
};
</script>

<template>
  <div class="flex flex-col gap-2">
    <base-card title="Receipt Information">
      <div class="flex flex-col gap-4">
        <base-select
          label="Bank Disbursement"
          required
          v-model="data.disbursement_bank_account_uuid"
          v-model:search="searchBank"
          :options="bankOptions"
          @select="onSelectedBank"
          :errors="errors?.['disbursement_bank_id']"
          :disabled="isSaving"
          placeholder="Select"
        />
      </div>
    </base-card>
    <base-card title="Disbursement Information">
      <div class="flex flex-col gap-4">
        <base-input-number align="left" layout="horizontal" label="Buying Price" :model-value="data.price" disabled />
        <base-input-number align="left" layout="horizontal" label="Principal Amount" :model-value="data.principal_amount" disabled />
        <base-input-number align="left" layout="horizontal" label="Remaining of Principal Amount" :model-value="data.remaining_amount" disabled allow-negative />
        <base-input-number required align="left" layout="horizontal" label="Selling Price" v-model="data.selling_price" :disabled="isSaving" />
        <base-input-number required align="left" layout="horizontal" label="Disbursement Amount" v-model="data.disbursement_amount" :disabled="isSaving" />
      </div>
    </base-card>
    <base-card title="Disbursement Receipt Information">
      <div class="flex flex-col gap-4">
        <base-input-number required align="left" layout="horizontal" label="Amount of Disbursement Received" v-model="data.disbursement_amount_received" :disabled="isSaving" />
        <base-datepicker layout="horizontal" label="Date Received of Disbursement" v-model="data.disbursement_date" :disabled="isSaving" />
        <base-input-number align="left" layout="horizontal" label="Nominal Difference" :model-value="data.disbursement_amount_remaining" disabled allow-negative />
        <base-textarea layout="horizontal" label="Disbursement Notes" :min-height="128" v-model="data.disbursement_notes" :disabled="isSaving" />
      </div>
    </base-card>
  </div>
</template>

<style scoped lang="postcss"></style>
