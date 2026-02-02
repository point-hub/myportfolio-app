<script setup lang="ts">
import { watchEffect } from 'vue';

import { useSelectableIssuers } from '@/composables/selectable/issuers';

import { type IForm, type IFormError } from './form';

const data = defineModel<IForm>('data');
const errors = defineModel<IFormError>('errors');
const isSaving = defineModel('is-saving', { default: false });

const { options: issuerOptions, searchIssuer } = useSelectableIssuers();

const onAdd = () => {
  data.value?.buying_list?.push({
    issuer_id: '',
    lots: 0,
    shares: 0,
    price: 0,
    total: 0,
  });
};

watchEffect(() => {
  data.value?.buying_list?.forEach((item) => {
    if (item.lots !== undefined) {
      item.shares = item.lots * 100;
    } else {
      item.shares = 0;
    }

    if (item.lots !== undefined && item.price !== undefined) {
      item.total = item.lots * 100 * item.price;
    } else {
      item.total = 0;
    }
  });
});

const onDelete = (index: number) => {
  data.value?.buying_list?.splice(index, 1);
};
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
          <th class="w-1"></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(buying, index) in data?.buying_list">
          <td class="text-center">{{ index + 1 }}</td>
          <td>
            <base-choosen
              title="Issuer"
              v-model:selectedValue="buying.issuer_id"
              v-model:search="searchIssuer"
              :options="issuerOptions"
              :errors="errors?.[`buying_list.${index}.issuer_id`]"
              :disabled="isSaving"
              placeholder="Select"
              border="none"
              paddingless
            />
          </td>
          <td><base-input-number v-model="buying.lots" :disabled="isSaving" decimal-length="2" border="none" paddingless /></td>
          <td><base-input-number :model-value="buying.shares" disabled decimal-length="2" border="none" paddingless /></td>
          <td><base-input-number v-model="buying.price" :disabled="isSaving" decimal-length="2" border="none" paddingless /></td>
          <td><base-input-number v-model="buying.total" :disabled="isSaving" decimal-length="2" border="none" paddingless /></td>
          <td>
            <base-button @click="onDelete(index)" variant="filled" color="danger" :disabled="isSaving">
              <base-icon class="i-fa7-regular:circle-x" />
            </base-button>
          </td>
        </tr>
      </tbody>
    </base-table>
    <base-button variant="filled" color="primary" :disabled="isSaving" @click="onAdd">
      Add
    </base-button>
  </base-card>
</template>

<style scoped lang="postcss"></style>
