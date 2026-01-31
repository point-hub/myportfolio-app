<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { findOwnerApi } from '@/composables/api/master/owners/find-by-id.api';

import CardBreadcrumbs from './card-breadcrumbs.vue';
import CardTable from './card-table.vue';

const route = useRoute();
const owner = ref();

onMounted(async () => {
  const response = await findOwnerApi(route.params.id as string);

  owner.value = response;
});
</script>

<template>
  <div class="content-container">
    <card-breadcrumbs :owner_identifier="`${owner?.code} - ${owner?.name}`" />
    <card-table />
  </div>
</template>
