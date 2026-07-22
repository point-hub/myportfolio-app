<script setup lang="ts">
import CardTabs from '../components/card-tabs.vue';
import CardBreadcrumbs from './card-breadcrumbs.vue';
import CardTable from './card-table.vue';
</script>

<template>
  <div class="content-container">
    <card-breadcrumbs />
    <card-tabs />
    <card-table />
  </div>
</template>
