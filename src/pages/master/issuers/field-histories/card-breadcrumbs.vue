<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

import AppBreadcrumb, { type IBreadcrumb } from '@/components/app-breadcrumb.vue';

const props = defineProps<{
  issuer_identifier: string
}>();

const route = useRoute();

const breadcrumbs = computed<IBreadcrumb[]>(() => [
  { name: 'Home', path: '/' },
  { name: 'Master', path: '/master' },
  { name: 'Issuers', path: '/master/issuers' },
  {
    name: props.issuer_identifier ?? String(route.params.id),
    path: `/master/issuers/${route.params.id}`,
  },
  {
    name: 'Audits',
    path: `/master/issuers/${route.params.id}/audits`,
  },
  {
    name: String(route.params.field),
  },
]);
</script>

<template>
  <app-breadcrumb :breadcrumbs="breadcrumbs" />
</template>
