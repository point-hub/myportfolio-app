<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { findDividendStockApi } from '@/composables/api/dividend-stocks/find-by-id.api';

import CardBreadcrumbs from './card-breadcrumbs.vue';
import CardTable from './card-table.vue';

const route = useRoute();
const dividendStock = ref();

onMounted(async () => {
  const response = await findDividendStockApi(route.params.id as string);

  dividendStock.value = response;
});
</script>

<template>
  <div class="content-container">
    <card-breadcrumbs :dividend_stock_identifier="`${dividendStock?.form_number}`" />
    <card-table />
  </div>
</template>
