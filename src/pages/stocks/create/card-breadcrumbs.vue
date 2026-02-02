<script setup lang="ts">
import AppBreadcrumb, { type IBreadcrumb } from '@/components/app-breadcrumb.vue';

const breadcrumbs: IBreadcrumb[] = [
  { name: 'Home', path: '/' },
  { name: 'Stocks', path: '/stocks' },
  { name: 'Create' },
];
</script>

<template>
  <app-breadcrumb :breadcrumbs="breadcrumbs" />
</template>
