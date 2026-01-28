<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

import AppBreadcrumb, { type IBreadcrumb } from '@/components/app-breadcrumb.vue';

const props = defineProps<{
  bank_identifier: string
}>();

const route = useRoute();

const breadcrumbs = computed<IBreadcrumb[]>(() => [
  { name: 'Home', path: '/' },
  { name: 'Master', path: '/master' },
  { name: 'Banks', path: '/master/banks' },
  {
    name: props.bank_identifier ?? String(route.params.id),
    path: `/master/banks/${route.params.id}`,
  },
  {
    name: 'Audits',
    path: `/master/banks/${route.params.id}/audits`,
  },
  {
    name: String(route.params.field),
  },
]);
</script>

<template>
  <app-breadcrumb :breadcrumbs="breadcrumbs" />
</template>
