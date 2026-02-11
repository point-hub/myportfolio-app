<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue';

import { useSelectableBanks } from '@/composables/selectable/banks';

import { type IForm, type IFormError } from './form';

const data = defineModel<IForm>('data', {
  default: () => ({
    placement: {
      type: undefined,
      bank_id: undefined,
      account_number: undefined,
      base_date: undefined,
      date: undefined,
      term: undefined,
      maturity_date: undefined,
      amount: undefined,
    },
  }),
});
const errors = defineModel<IFormError>('errors', {
  default: () => ({
    'placement.type': [],
    'placement.bank_id': [],
    'placement.account_number': [],
    'placement.base_date': [],
    'placement.date': [],
    'placement.term': [],
    'placement.maturity_date': [],
    'placement.amount': [],
  }),
});
const isSaving = defineModel('is-saving', { default: false });

const { options, searchBank } = useSelectableBanks();
const typeOptions = ref([
  { label: 'On Call', value: 'on-call' },
  { label: 'On Hold', value: 'on-hold' },
]);

const maturityDate = computed(() => {
  const { date, term } = data.value.placement;
  if (!date) return undefined;

  const base = new Date(date as string);
  base.setDate(base.getDate() + Number(term ?? 0));

  return base.toISOString().slice(0, 10);
});

watchEffect(() => {
  data.value.placement.maturity_date = maturityDate.value;
});
</script>

<template>
  <base-card title="Placement">
    <div class="flex flex-col gap-4 my-5">
      <base-select
        label="Type"
        required
        v-model="data.placement.type"
        :options="typeOptions"
        :errors="errors['placement.type']"
        :disabled="isSaving"
        placeholder="Select"
      />
      <base-select
        label="Bank"
        required
        v-model="data.placement.bank_id"
        v-model:search="searchBank"
        :options="options"
        :errors="errors['placement.bank_id']"
        :disabled="isSaving"
        placeholder="Select"
        description="Bank where you placed the saving"
      />
      <base-input layout="h" label="Account Number" required v-model="data.placement.account_number" :errors="errors['placement.base_date']" :disabled="isSaving" />
      <base-input-number layout="h" label="Base Date" align="left" required v-model="data.placement.base_date" :errors="errors['placement.base_date']" :disabled="isSaving" />
      <base-datepicker layout="h" label="Placement Date" required v-model="data.placement.date" :errors="errors['placement.date']" :disabled="isSaving" description="Placement Date" />
      <base-input-number layout="h" label="Term" align="left" required v-model="data.placement.term" :errors="errors['placement.term']" :disabled="isSaving" description="How many days" />
      <base-datepicker layout="h" label="Maturity Date" required v-model="maturityDate" :errors="errors['placement.maturity_date']" disabled description="Placement Date + Term" />
      <base-input-number layout="h" label="Amount" align="left" required v-model="data.placement.amount" :errors="errors['placement.amount']" :disabled="isSaving" />
    </div>
  </base-card>
</template>

<style scoped lang="postcss"></style>
