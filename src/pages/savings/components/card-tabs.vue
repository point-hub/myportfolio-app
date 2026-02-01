<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

import { useAuthStore } from '@/stores/auth.store';

const authStore = useAuthStore();
const route = useRoute();

const isSavings = computed(() => route.path === '/savings');
const isSavingInterests = computed(() => route.path === '/savings/interests');
const isSavingCashbacks = computed(() => route.path === '/savings/cashbacks');
</script>

<template>
  <base-card class="py-3! gap-0!">
    <div class="flex gap-2 overflow-auto scrollbar-hidden">
      <router-link v-if="authStore.hasPermission('savings:module')" :to="`/savings`">
        <base-button variant="filled" :color="isSavings ? 'primary' : 'info'" size="sm" class="font-bold">
          <base-icon icon="i-fa7-solid:rectangle-history-circle-user" /> LIST DEPOSITS
        </base-button>
      </router-link>
      <router-link v-if="authStore.hasPermission('savings:module')" :to="`/savings/interests`">
        <base-button variant="filled" :color="isSavingInterests ? 'primary' : 'info'" size="sm" class="font-bold">
          <base-icon icon="i-fa7-solid:rectangle-history-circle-user" /> LIST INTERESTS
        </base-button>
      </router-link>
      <router-link v-if="authStore.hasPermission('savings:module')" :to="`/savings/cashbacks`">
        <base-button variant="filled" :color="isSavingCashbacks ? 'primary' : 'info'" size="sm" class="font-bold">
          <base-icon icon="i-fa7-solid:rectangle-history-circle-user" /> LIST CASHBACKS
        </base-button>
      </router-link>
    </div>
  </base-card>
</template>

<style scoped lang="postcss"></style>
