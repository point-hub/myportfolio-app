<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { findBankApi } from '@/composables/api/master/banks/find-by-id.api';

import CardBreadcrumbs from './card-breadcrumbs.vue';
import CardTable from './card-table.vue';

const route = useRoute();
const bank = ref();

onMounted(async () => {
  const response = await findBankApi(route.params.id as string);

  bank.value = response;
});
</script>

<template>
  <div class="content-container">
    <card-breadcrumbs :bank_identifier="`${bank?.code} - ${bank?.name}`" />
    <card-table />
  </div>
</template>
