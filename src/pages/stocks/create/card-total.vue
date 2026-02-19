<script setup lang="ts">
import { watchEffect } from 'vue';

import { type IForm, type IFormError } from './form';

const data = defineModel<IForm>('data', {
  default: () => ({
    buying_total: 0,
    buying_brokerage_fee: 0,
    buying_vat: 0,
    buying_levy: 0,
    buying_kpei: 0,
    buying_stamp: 0,
    buying_proceed: 0,
    selling_total: 0,
    selling_brokerage_fee: 0,
    selling_vat: 0,
    selling_levy: 0,
    selling_kpei: 0,
    selling_stamp: 0,
    selling_proceed: 0,
  }),
});

const errors = defineModel<IFormError>('errors');
const isSaving = defineModel('is-saving', { default: false });

watchEffect(() => {
  data.value.buying_total = data.value.buying_list?.reduce((sum, item) => {
    return sum + (item.total ?? 0);
  }, 0) ?? 0;

  data.value.buying_proceed
    = (data.value.buying_total ?? 0)
    + (data.value.buying_brokerage_fee ?? 0)
    + (data.value.buying_vat ?? 0)
    + (data.value.buying_levy ?? 0)
    + (data.value.buying_kpei ?? 0)
    + (data.value.buying_stamp ?? 0);

  data.value.selling_total = data.value.selling_list?.reduce((sum, item) => {
    return sum + (item.total ?? 0);
  }, 0) ?? 0;

  data.value.selling_proceed
    = (data.value.selling_total ?? 0)
    - (data.value.selling_brokerage_fee ?? 0)
    - (data.value.selling_vat ?? 0)
    - (data.value.selling_levy ?? 0)
    - (data.value.selling_kpei ?? 0)
    - (data.value.selling_stamp ?? 0);

  data.value.proceed_amount = data.value.buying_proceed - data.value.selling_proceed;
});
</script>

<template>
  <base-card title="total">
    <base-table class="min-h-48">
      <thead>
        <tr>
          <th></th>
          <th class="text-right w-32">Buying</th>
          <th class="text-right w-32">Selling</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="font-bold">Total Trade Amount</td>
          <td><base-input-number :model-value="data.buying_total" disabled decimal-length="2" border="none" paddingless /></td>
          <td><base-input-number :model-value="data.selling_total" disabled decimal-length="2" border="none" paddingless /></td>
        </tr>
        <tr>
          <td class="font-bold">Brokerage Fee</td>
          <td><base-input-number v-model="data.buying_brokerage_fee" :errors="errors?.['buying_brokerage_fee']" :disabled="isSaving" decimal-length="2" border="none" paddingless /></td>
          <td><base-input-number v-model="data.selling_brokerage_fee" :errors="errors?.['selling_brokerage_fee']" :disabled="isSaving" decimal-length="2" border="none" paddingless /></td>
        </tr>
        <tr>
          <td class="font-bold">VAT</td>
          <td><base-input-number v-model="data.buying_vat" :errors="errors?.['buying_vat']" :disabled="isSaving" decimal-length="2" border="none" paddingless /></td>
          <td><base-input-number v-model="data.selling_vat" :errors="errors?.['selling_vat']" :disabled="isSaving" decimal-length="2" border="none" paddingless /></td>
        </tr>
        <tr>
          <td class="font-bold">Levy</td>
          <td><base-input-number v-model="data.buying_levy" :errors="errors?.['buying_levy']" :disabled="isSaving" decimal-length="2" border="none" paddingless /></td>
          <td><base-input-number v-model="data.selling_levy" :errors="errors?.['selling_levy']" :disabled="isSaving" decimal-length="2" border="none" paddingless /></td>
        </tr>
        <tr>
          <td class="font-bold">KPEI</td>
          <td><base-input-number v-model="data.buying_kpei" :errors="errors?.['buying_kpei']" :disabled="isSaving" decimal-length="2" border="none" paddingless /></td>
          <td><base-input-number v-model="data.selling_kpei" :errors="errors?.['selling_kpei']" :disabled="isSaving" decimal-length="2" border="none" paddingless /></td>
        </tr>
        <tr>
          <td class="font-bold">Stamp</td>
          <td><base-input-number v-model="data.buying_stamp" :errors="errors?.['buying_stamp']" :disabled="isSaving" decimal-length="2" border="none" paddingless /></td>
          <td><base-input-number v-model="data.selling_stamp" :errors="errors?.['selling_stamp']" :disabled="isSaving" decimal-length="2" border="none" paddingless /></td>
        </tr>
        <tr>
          <td class="font-bold">Proceed Amount</td>
          <td><base-input-number :model-value="data.buying_proceed" disabled decimal-length="2" border="none" paddingless allow-negative /></td>
          <td><base-input-number :model-value="data.selling_proceed" disabled decimal-length="2" border="none" paddingless allow-negative /></td>
        </tr>
        <tr>
          <td class="font-bold">Pay To</td>
          <td colspan="2"><base-input-number :model-value="data.proceed_amount" disabled decimal-length="2" border="none" paddingless /></td>
        </tr>
      </tbody>
    </base-table>
  </base-card>
</template>

<style scoped lang="postcss"></style>
