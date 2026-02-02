<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

import { useAuthStore } from '@/stores/auth.store';

const authStore = useAuthStore();
const route = useRoute();

const isStocks = computed(() => route.path === '/stocks');
const isStockPaymnet = computed(() => route.path === '/stocks/payments');
const isStockDividend = computed(() => route.path === '/stocks/dividends');
</script>

<template>
  <base-card class="py-3! gap-0!">
    <div class="flex gap-2 overflow-auto scrollbar-hidden">
      <router-link v-if="authStore.hasPermission('stocks:module')" :to="`/stocks`">
        <base-button variant="filled" :color="isStocks ? 'primary' : 'info'" size="sm" class="font-bold">
          <base-icon icon="i-fa7-solid:rectangle-history-circle-user" /> LIST TRADE CONFIRMATION
        </base-button>
      </router-link>
      <router-link v-if="authStore.hasPermission('stocks:payment')" :to="`/stocks/payments`">
        <base-button variant="filled" :color="isStockPaymnet ? 'primary' : 'info'" size="sm" class="font-bold">
          <base-icon icon="i-fa7-solid:rectangle-history-circle-user" /> LIST PAYMENT
        </base-button>
      </router-link>
      <router-link v-if="authStore.hasPermission('stocks:dividen')" :to="`/stocks/dividends`">
        <base-button variant="filled" :color="isStockDividend ? 'primary' : 'info'" size="sm" class="font-bold">
          <base-icon icon="i-fa7-solid:rectangle-history-circle-user" /> LIST DIVIDEND
        </base-button>
      </router-link>
    </div>
  </base-card>
</template>

<style scoped lang="postcss"></style>
