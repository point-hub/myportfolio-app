<script setup lang="ts">
import { watchEffect } from 'vue';

import { useSelectableIssuers } from '@/composables/selectable/issuers';

import { type IForm, type IFormError } from './form';

const data = defineModel<IForm>('data');
const errors = defineModel<IFormError>('errors');
const isSaving = defineModel('is-saving', { default: false });

const { options: issuerOptions, searchIssuer } = useSelectableIssuers();

watchEffect(() => {
  data.value?.selling_list?.forEach((item) => {
    if (item.lots !== undefined) {
      item.shares = item.lots * 100;
    } else {
      item.shares = undefined;
    }

    if (item.lots !== undefined && item.price !== undefined) {
      item.total = item.lots * 100 * item.price;
    } else {
      item.total = undefined;
    }
  });
});
</script>

<template>
  <base-card title="buy">
    <base-table class="min-h-48">
      <thead>
        <tr>
          <th class="w-1">No</th>
          <th>Issuer</th>
          <th class="text-right w-24">Lots</th>
          <th class="text-right w-24">Share</th>
          <th class="text-right w-32">Price</th>
          <th class="text-right w-32">Total</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(selling, index) in data?.selling_list">
          <td class="text-center">{{ index + 1 }}</td>
          <td>
            <base-choosen
              title="Issuer"
              v-model:selectedValue="selling.issuer_id"
              v-model:search="searchIssuer"
              :options="issuerOptions"
              :errors="errors?.[`selling_list.${index}.issuer_id`]"
              :disabled="isSaving"
              placeholder="Select"
              border="none"
              paddingless
            />
          </td>
          <td><base-input-number v-model="selling.lots" :disabled="isSaving" decimal-length="2" border="none" paddingless /></td>
          <td><base-input-number :model-value="selling.shares" disabled decimal-length="2" border="none" paddingless /></td>
          <td><base-input-number v-model="selling.price" :disabled="isSaving" decimal-length="2" border="none" paddingless /></td>
          <td><base-input-number v-model="selling.total" :disabled="isSaving" decimal-length="2" border="none" paddingless /></td>
        </tr>
      </tbody>
    </base-table>
  </base-card>
</template>

<style scoped lang="postcss"></style>
