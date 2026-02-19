<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { findBondApi } from '@/composables/api/bonds/find-by-id.api';

import CardBreadcrumbs from './card-breadcrumbs.vue';
import CardTable from './card-table.vue';

const route = useRoute();
const bond = ref();

onMounted(async () => {
  const response = await findBondApi(route.params.id as string);

  bond.value = response;
});
</script>

<template>
  <div class="content-container">
    <card-breadcrumbs :bond_identifier="`${bond?.form_number}`" />
    <card-table />
  </div>
</template>
