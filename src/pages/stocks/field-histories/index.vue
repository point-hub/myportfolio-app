<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { findStockApi } from '@/composables/api/stocks/find-by-id.api';

import CardBreadcrumbs from './card-breadcrumbs.vue';
import CardTable from './card-table.vue';

const route = useRoute();
const stock = ref();

onMounted(async () => {
  const response = await findStockApi(route.params.id as string);

  stock.value = response;
});
</script>

<template>
  <div class="content-container">
    <card-breadcrumbs :stock_identifier="`${stock?.form_number}`" />
    <card-table />
  </div>
</template>
