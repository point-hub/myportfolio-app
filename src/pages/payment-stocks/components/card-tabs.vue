<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

import { useAuthStore } from '@/stores/auth.store';

const authStore = useAuthStore();
const route = useRoute();

const isPaymentStocks = computed(() => route.path === '/stocks');
const isPaymentStockPaymnet = computed(() => route.path === '/payment-stocks');
const isPaymentStockDividend = computed(() => route.path === '/payment-dividends');
</script>

<template>
  <base-card class="py-3! gap-0!">
    <div class="flex gap-2 overflow-auto scrollbar-hidden">
      <router-link v-if="authStore.hasPermission('stocks:module')" :to="`/stocks`">
        <base-button variant="filled" :color="isPaymentStocks ? 'primary' : 'info'" size="sm" class="font-bold">
          <base-icon icon="i-fa7-solid:rectangle-history-circle-user" /> LIST TRADE CONFIRMATION
        </base-button>
      </router-link>
      <router-link v-if="authStore.hasPermission('payment-stocks:module')" :to="`/payment-stocks`">
        <base-button variant="filled" :color="isPaymentStockPaymnet ? 'primary' : 'info'" size="sm" class="font-bold">
          <base-icon icon="i-fa7-solid:rectangle-history-circle-user" /> LIST PAYMENT
        </base-button>
      </router-link>
      <router-link v-if="authStore.hasPermission('dividend-stocks:module')" :to="`/payment-dividends`">
        <base-button variant="filled" :color="isPaymentStockDividend ? 'primary' : 'info'" size="sm" class="font-bold">
          <base-icon icon="i-fa7-solid:rectangle-history-circle-user" /> LIST DIVIDEND
        </base-button>
      </router-link>
    </div>
  </base-card>
</template>

<style scoped lang="postcss"></style>
