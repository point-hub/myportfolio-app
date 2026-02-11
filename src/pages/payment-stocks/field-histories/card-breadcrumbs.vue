<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

import AppBreadcrumb, { type IBreadcrumb } from '@/components/app-breadcrumb.vue';

const props = defineProps<{
  payment_stock_identifier: string
}>();

const route = useRoute();

const breadcrumbs = computed<IBreadcrumb[]>(() => [
  { name: 'Home', path: '/' },
  { name: 'Payment Stocks', path: '/payment-stocks' },
  {
    name: props.payment_stock_identifier ?? String(route.params.id),
    path: `/payment-stocks/${route.params.id}`,
  },
  {
    name: 'Audits',
    path: `/payment-stocks/${route.params.id}/audits`,
  },
  {
    name: String(route.params.field),
  },
]);
</script>

<template>
  <app-breadcrumb :breadcrumbs="breadcrumbs" />
</template>
