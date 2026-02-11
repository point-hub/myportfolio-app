<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { findSavingApi } from '@/composables/api/savings/find-by-id.api';

import CardBreadcrumbs from './card-breadcrumbs.vue';
import CardTable from './card-table.vue';

const route = useRoute();
const saving = ref();

onMounted(async () => {
  const response = await findSavingApi(route.params.id as string);

  saving.value = response;
});
</script>

<template>
  <div class="content-container">
    <card-breadcrumbs :saving_identifier="`${saving?.form_number}`" />
    <card-table />
  </div>
</template>
