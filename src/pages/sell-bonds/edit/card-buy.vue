<script setup lang="ts">
import { onMounted, watchEffect } from 'vue';

import { retrieveCounterApi } from '@/composables/api/counters/retrieve.api';
import { type IBankAccountOption,useSelectableBankAccounts } from '@/composables/selectable/bank-accounts';
import { useSelectableOwners } from '@/composables/selectable/owners';

import { type IForm, type IFormError } from './form';

const data = defineModel<IForm>('data', {
  default: () => ({
    bank_source_id: undefined,
    bank_source_account_uuid: undefined,
    bank_placement_id: undefined,
    bank_placement_account_uuid: undefined,
    owner_id: undefined,
    base_date: undefined,
    transaction_date: undefined,
    settlement_date: undefined,
    maturity_date: undefined,
    transaction_number: undefined,
    price: undefined,
    principal_amount: undefined,
    proceed_amount: undefined,
    accrued_interest: undefined,
    total_proceed: undefined,
    coupon_rate: undefined,
    coupon_tenor: undefined,
    coupon_tax_rate: undefined,
  }),
});
const errors = defineModel<IFormError>('errors', {
  default: () => ({
    bank_source_id: [],
    bank_source_account_uuid: [],
    bank_placement_id: [],
    bank_placement_account_uuid: [],
    owner_id: [],
    base_date: [],
    transaction_date: [],
    settlement_date: [],
    maturity_date: [],
    transaction_number: [],
    price: [],
    principal_amount: [],
    proceed_amount: [],
    accrued_interest: [],
    total_proceed: [],
    coupon_rate: [],
    coupon_tenor: [],
    coupon_tax_rate: [],
  }),
});
const isSaving = defineModel('is-saving', { default: false });

const { options: bankSourceOptions, searchBank: searchBankSource } = useSelectableBankAccounts();
const { options: bankPlacementOptions, searchBank: searchBankPlacement } = useSelectableBankAccounts();
const { options: ownerOptions, searchOwner: searchOwner } = useSelectableOwners();

watchEffect(() => {
  data.value.proceed_amount = (data.value.principal_amount ?? 0) * (data.value.price ?? 0) / 100;
  data.value.total_proceed = data.value.proceed_amount + (data.value.accrued_interest ?? 0);
});

onMounted(async () => {
  const counter = await retrieveCounterApi('bonds', new Date());
  data.value.form_number = counter.value;
});

const onSelectedBankSource = (selected: IBankAccountOption) => {
  data.value.bank_source_id = selected.bank_id;
};

const onSelectedBankPlacement = (selected: IBankAccountOption) => {
  data.value.bank_placement_id = selected.bank_id;
};
</script>

<template>
  <base-card title="Buy Information">
    <div class="flex flex-col gap-4 my-5">
      <base-select
        label="Bank Source"
        required
        v-model="data.bank_source_account_uuid"
        v-model:search="searchBankSource"
        :options="bankSourceOptions"
        @select="onSelectedBankSource"
        :errors="errors['bank_source_id']"
        :disabled="isSaving"
        placeholder="Select"
      />
      <base-select
        label="Bank Placement"
        required
        v-model="data.bank_placement_account_uuid"
        v-model:search="searchBankPlacement"
        :options="bankPlacementOptions"
        @select="onSelectedBankPlacement"
        :errors="errors['bank_placement_id']"
        :disabled="isSaving"
        placeholder="Select"
      />
      <base-select
        label="Owner"
        required
        v-model="data.owner_id"
        v-model:search="searchOwner"
        :options="ownerOptions"
        :errors="errors.owner_id"
        :disabled="isSaving"
        placeholder="Select"
      />
      <base-input-number layout="horizontal" label="Base Date" align="left" required v-model="data.base_date" :errors="errors.base_date" :disabled="isSaving" />
      <base-datepicker layout="horizontal" label="Transaction Date" required v-model="data.transaction_date" :errors="errors.transaction_date" :disabled="isSaving" />
      <base-datepicker layout="horizontal" label="Settlement Date" required v-model="data.settlement_date" :errors="errors.settlement_date" :disabled="isSaving" />
      <base-datepicker layout="horizontal" label="Maturity Date" required v-model="data.maturity_date" :errors="errors.maturity_date" :disabled="isSaving" />
      <base-input layout="horizontal" label="Transaction Number" required v-model="data.transaction_number" :errors="errors.transaction_number" :disabled="isSaving" />

      <base-input-number layout="horizontal" label="Price" align="left" required v-model="data.price" :errors="errors.price" :disabled="isSaving" />
      <base-input-number layout="horizontal" label="Principal Amount" align="left" required v-model="data.principal_amount" :errors="errors.principle_amount" :disabled="isSaving" />
      <base-input-number layout="horizontal" label="Proceed Amount" align="left" required v-model="data.proceed_amount" :errors="errors.proceed_amount" :disabled="isSaving" />
      <base-input-number layout="horizontal" label="Accrued Interest" align="left" required v-model="data.accrued_interest" :errors="errors.accrued_interest" :disabled="isSaving" />
      <base-input-number layout="horizontal" label="Total Proceed" align="left" required v-model="data.total_proceed" :errors="errors.total_proceed" :disabled="isSaving" />

      <base-input-number layout="horizontal" label="Coupon Rate" align="left" required v-model="data.coupon_rate" :errors="errors.coupon_rate" :disabled="isSaving" />
      <base-input-number layout="horizontal" label="Coupon Tenor" align="left" required v-model="data.coupon_tenor" :errors="errors.coupon_tenor" :disabled="isSaving" />
      <base-input-number layout="horizontal" label="Coupon Tax Rate" align="left" required v-model="data.coupon_tax_rate" :errors="errors.coupon_tax_rate" :disabled="isSaving" />
    </div>
  </base-card>
</template>

<style scoped lang="postcss"></style>
