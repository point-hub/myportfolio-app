<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

import { useAuthStore } from '@/stores/auth.store';

const authStore = useAuthStore();
const route = useRoute();

const isBonds = computed(() => route.path === '/bonds');
const isBondCoupon = computed(() => route.path === '/coupon-bonds');
const isBondSell = computed(() => route.path === '/sell-bonds');
</script>

<template>
  <base-card class="py-3! gap-0!">
    <div class="flex gap-2 overflow-auto scrollbar-hidden">
      <router-link v-if="authStore.hasPermission('bonds:module')" :to="`/bonds`">
        <base-button variant="filled" :color="isBonds ? 'primary' : 'info'" size="sm" class="font-bold">
          <base-icon icon="i-fa7-solid:rectangle-history-circle-user" /> BUY BONDS
        </base-button>
      </router-link>
      <router-link v-if="authStore.hasPermission('bonds:module')" :to="`/coupon-bonds`">
        <base-button variant="filled" :color="isBondCoupon ? 'primary' : 'info'" size="sm" class="font-bold">
          <base-icon icon="i-fa7-solid:rectangle-history-circle-user" /> BOND COUPON
        </base-button>
      </router-link>
      <router-link v-if="authStore.hasPermission('bonds:module')" :to="`/sell-bonds`">
        <base-button variant="filled" :color="isBondSell ? 'primary' : 'info'" size="sm" class="font-bold">
          <base-icon icon="i-fa7-solid:rectangle-history-circle-user" /> SELL BOND
        </base-button>
      </router-link>
    </div>
  </base-card>
</template>

<style scoped lang="postcss"></style>
