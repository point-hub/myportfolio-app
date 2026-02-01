<script setup lang="ts">
import { type IForm } from './form';

const data = defineModel<IForm>('data', {
  default: () => ({
    form_number: undefined,
    owner: undefined,
    group: undefined,
  }),
});
</script>

<template>
  <base-card title="Savings">
    <div class="flex flex-col gap-4">
      <base-input layout="horizontal" label="Form Number" disabled :model-value="data.form_number" />
      <base-input layout="horizontal" label="Owner" disabled :model-value="data.owner?.name" />
      <base-input layout="horizontal" label="Group" disabled :model-value="data.group?.name" />
    </div>
  </base-card>
</template>

<style scoped lang="postcss"></style>
