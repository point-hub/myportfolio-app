<script setup lang="ts">
import { onMounted, ref } from 'vue';

import AppMenu, { type IMenu } from '@/components/app-menu.vue';
import { useAuthStore } from '@/stores/auth.store';

const breadcrumbs = [
  {
    name: 'Home',
    path: '/',
  },
];

const menus = ref<IMenu[]>([]);
const authStore = useAuthStore();

onMounted(() => {
  if (authStore.hasPermissions(['master:module'])) { menus.value.push({ name: 'Master', path: '/master', icon: 'i-fa7-solid:address-card' }); }
  if (authStore.hasPermissions(['savings:module'])) { menus.value.push({ name: 'Savings', path: '/savings', icon: 'i-fa7-solid:piggy-bank' }); }
  if (authStore.hasPermissions(['deposits:module'])) { menus.value.push({ name: 'Deposits', path: '/deposits', icon: 'i-fa7-solid:vault' }); }
  if (authStore.hasPermissions(['insurances:module'])) { menus.value.push({ name: 'Insurances', path: '/insurances', icon: 'i-fa7-solid:money-check-pen' }); }
  if (authStore.hasPermissions(['bonds:module'])) { menus.value.push({ name: 'Bonds', path: '/bonds', icon: 'i-fa7-solid:file' }); }
  if (authStore.hasPermissions(['stocks:module'])) { menus.value.push({ name: 'Stocks', path: '/stocks', icon: 'i-fa7-solid:arrow-trend-up' }); }
});
</script>

<template>
  <app-menu :breadcrumbs="breadcrumbs" v-model:menus="menus" />
</template>
