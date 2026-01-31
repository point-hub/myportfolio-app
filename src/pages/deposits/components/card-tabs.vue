<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

import { useAuthStore } from '@/stores/auth.store';

const authStore = useAuthStore();
const route = useRoute();

const isDeposits = computed(() => route.path === '/deposits');
const isDepositInterests = computed(() => route.path === '/deposits/interests');
const isDepositCashbacks = computed(() => route.path === '/deposits/cashbacks');
</script>

<template>
  <base-card class="py-3! gap-0!">
    <div class="flex gap-2 overflow-auto scrollbar-hidden">
      <router-link v-if="authStore.hasPermission('deposits:module')" :to="`/deposits`">
        <base-button variant="filled" :color="isDeposits ? 'primary' : 'info'" size="sm" class="font-bold">
          <base-icon icon="i-fa7-solid:rectangle-history-circle-user" /> LIST DEPOSITS
        </base-button>
      </router-link>
      <router-link v-if="authStore.hasPermission('deposits:module')" :to="`/deposits/interests`">
        <base-button variant="filled" :color="isDepositInterests ? 'primary' : 'info'" size="sm" class="font-bold">
          <base-icon icon="i-fa7-solid:rectangle-history-circle-user" /> LIST INTERESTS
        </base-button>
      </router-link>
      <router-link v-if="authStore.hasPermission('deposits:module')" :to="`/deposits/cashbacks`">
        <base-button variant="filled" :color="isDepositCashbacks ? 'primary' : 'info'" size="sm" class="font-bold">
          <base-icon icon="i-fa7-solid:rectangle-history-circle-user" /> LIST CASHBACKS
        </base-button>
      </router-link>
    </div>
  </base-card>
</template>

<style scoped lang="postcss"></style>
