<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { findIssuerApi } from '@/composables/api/master/issuers/find-by-id.api';

import CardBreadcrumbs from './card-breadcrumbs.vue';
import CardTable from './card-table.vue';

const route = useRoute();
const issuer = ref();

onMounted(async () => {
  const response = await findIssuerApi(route.params.id as string);

  issuer.value = response;
});
</script>

<template>
  <div class="content-container">
    <card-breadcrumbs :issuer_identifier="`${issuer?.code} - ${issuer?.name}`" />
    <card-table />
  </div>
</template>
