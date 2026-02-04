<script setup lang="ts">
import { watchEffect } from 'vue';

import { useSelectableIssuers } from '@/composables/selectable/issuers';

import { type IForm } from './form';

const data = defineModel<IForm>('data');

const { options: issuerOptions, searchIssuer } = useSelectableIssuers();

watchEffect(() => {
  data.value?.buying_list?.forEach((item) => {
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
        <tr v-for="(buying, index) in data?.buying_list">
          <td class="text-center">{{ index + 1 }}</td>
          <td>
            <base-choosen
              title="Issuer"
              v-model="buying.issuer_id"
              v-model:search="searchIssuer"
              :options="issuerOptions"
              disabled
              placeholder="Select"
              border="none"
              paddingless
            />
          </td>
          <td><base-input-number v-model="buying.lots" disabled decimal-length="2" border="none" paddingless /></td>
          <td><base-input-number :model-value="buying.shares" disabled decimal-length="2" border="none" paddingless /></td>
          <td><base-input-number v-model="buying.price" disabled decimal-length="2" border="none" paddingless /></td>
          <td><base-input-number v-model="buying.total" disabled decimal-length="2" border="none" paddingless /></td>
        </tr>
      </tbody>
    </base-table>
  </base-card>
</template>

<style scoped lang="postcss"></style>
