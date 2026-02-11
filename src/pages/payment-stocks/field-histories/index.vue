<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { findPaymentStockApi } from '@/composables/api/payment-stocks/find-by-id.api';

import CardBreadcrumbs from './card-breadcrumbs.vue';
import CardTable from './card-table.vue';

const route = useRoute();
const paymentStock = ref();

onMounted(async () => {
  const response = await findPaymentStockApi(route.params.id as string);

  paymentStock.value = response;
});
</script>

<template>
  <div class="content-container">
    <card-breadcrumbs :payment_stock_identifier="`${paymentStock?.form_number}`" />
    <card-table />
  </div>
</template>
