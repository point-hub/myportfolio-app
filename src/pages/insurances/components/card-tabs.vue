<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

import { useAuthStore } from '@/stores/auth.store';

const authStore = useAuthStore();
const route = useRoute();

const isInsurances = computed(() => route.path === '/insurances');
const isInsuranceInterests = computed(() => route.path === '/insurances/interests');
const isInsuranceCashbacks = computed(() => route.path === '/insurances/cashbacks');
</script>

<template>
  <base-card class="py-3! gap-0!">
    <div class="flex gap-2 overflow-auto scrollbar-hidden">
      <router-link v-if="authStore.hasPermission('insurances:module')" :to="`/insurances`">
        <base-button variant="filled" :color="isInsurances ? 'primary' : 'info'" size="sm" class="font-bold">
          <base-icon icon="i-fa7-solid:rectangle-history-circle-user" /> LIST INSURANCES
        </base-button>
      </router-link>
      <router-link v-if="authStore.hasPermission('insurances:module')" :to="`/insurances/interests`">
        <base-button variant="filled" :color="isInsuranceInterests ? 'primary' : 'info'" size="sm" class="font-bold">
          <base-icon icon="i-fa7-solid:rectangle-history-circle-user" /> LIST INTERESTS
        </base-button>
      </router-link>
      <router-link v-if="authStore.hasPermission('insurances:module')" :to="`/insurances/cashbacks`">
        <base-button variant="filled" :color="isInsuranceCashbacks ? 'primary' : 'info'" size="sm" class="font-bold">
          <base-icon icon="i-fa7-solid:rectangle-history-circle-user" /> LIST CASHBACKS
        </base-button>
      </router-link>
    </div>
  </base-card>
</template>

<style scoped lang="postcss"></style>
