<script setup lang="ts">
import { type IForm } from './form';

const data = defineModel<IForm>('data', {
  default: () => ({
    created_by: undefined,
    created_at: undefined,
  }),
});
</script>

<template>
  <base-card title="metadata">
    <div class="flex flex-col gap-4">
      <base-input layout="horizontal" label="Created By" disabled :model-value="data.created_by?.name" />
      <base-input layout="horizontal" label="Created At" disabled :model-value="data.created_at" />
    </div>
  </base-card>
</template>

<style scoped lang="postcss"></style>
