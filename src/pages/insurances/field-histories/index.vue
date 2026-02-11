<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { findInsuranceApi } from '@/composables/api/insurances/find-by-id.api';

import CardBreadcrumbs from './card-breadcrumbs.vue';
import CardTable from './card-table.vue';

const route = useRoute();
const insurance = ref();

onMounted(async () => {
  const response = await findInsuranceApi(route.params.id as string);

  insurance.value = response;
});
</script>

<template>
  <div class="content-container">
    <card-breadcrumbs :insurance_identifier="`${insurance?.form_number}`" />
    <card-table />
  </div>
</template>
