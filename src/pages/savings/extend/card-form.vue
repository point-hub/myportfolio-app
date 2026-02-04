<script setup lang="ts">
import { onMounted } from 'vue';

import { retrieveCounterApi } from '@/composables/api/counters/retrieve.api';
import { useSelectableOwners } from '@/composables/selectable/owners';

import { type IForm, type IFormError } from './form';

const data = defineModel<IForm>('data', {
  default: () => ({
    form_number: undefined,
    owner_id: undefined,
    group_id: undefined,
  }),
});
const errors = defineModel<IFormError>('errors', {
  default: () => ({
    form_number: [],
    owner_id: [],
    group_id: [],
  }),
});
const isSaving = defineModel('is-saving', { default: false });

const { options: ownerOptions, searchOwner } = useSelectableOwners();
const { options: groupOptions, searchOwner: searchGroup } = useSelectableOwners();

onMounted(async () => {
  const counter = await retrieveCounterApi('savings', new Date());
  data.value.form_number = counter.value;
});
</script>

<template>
  <base-card title="Savings">
    <div class="flex flex-col gap-4">
      <base-input
        layout="horizontal"
        label="Form Number"
        required
        v-model="data.form_number"
        :errors="errors.form_number"
        disabled
      />
      <base-select
        label="Owner"
        required
        v-model="data.owner_id"
        :selectedLabel="data.owner?.name"
        v-model:search="searchOwner"
        :options="ownerOptions"
        :errors="errors.owner_id"
        :disabled="isSaving"
        placeholder="Select"
      />
      <base-select
        label="Group"
        required
        v-model="data.group_id"
        v-model:search="searchGroup"
        :options="groupOptions"
        :errors="errors.group_id"
        :disabled="isSaving"
        placeholder="Select"
      />
    </div>
  </base-card>
</template>

<style scoped lang="postcss"></style>
