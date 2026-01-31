<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { findBrokerApi } from '@/composables/api/master/brokers/find-by-id.api';

import CardBreadcrumbs from './card-breadcrumbs.vue';
import CardTable from './card-table.vue';

const route = useRoute();
const broker = ref();

onMounted(async () => {
  const response = await findBrokerApi(route.params.id as string);

  broker.value = response;
});
</script>

<template>
  <div class="content-container">
    <card-breadcrumbs :broker_identifier="`${broker?.code} - ${broker?.name}`" />
    <card-table />
  </div>
</template>
