<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { findDepositApi } from '@/composables/api/deposits/find-by-id.api';

import CardBreadcrumbs from './card-breadcrumbs.vue';
import CardTable from './card-table.vue';

const route = useRoute();
const deposit = ref();

onMounted(async () => {
  const response = await findDepositApi(route.params.id as string);

  deposit.value = response;
});
</script>

<template>
  <div class="content-container">
    <card-breadcrumbs :deposit_identifier="`${deposit?.form_number}`" />
    <card-table />
  </div>
</template>
