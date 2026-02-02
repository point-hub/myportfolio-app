<script setup lang="ts">
import { ref } from 'vue';

import { createStockApi } from '@/composables/api/stocks/create.api';
import { draftStockApi } from '@/composables/api/stocks/draft.api';
import router from '@/router';
import { toast } from '@/toast';
import { handleError } from '@/utils/api';

import CardBreadcrumbs from './card-breadcrumbs.vue';
import CardBuying from './card-buying.vue';
import CardForm from './card-form.vue';
import CardInternalNotes from './card-internal-notes.vue';
import CardSelling from './card-selling.vue';
import CardTotal from './card-total.vue';
import { useForm } from './form';

const form = useForm();

const isSaving = ref(false);

const onSaveAsDraft = async () => {
  try {
    isSaving.value = true;
    const response = await draftStockApi(form.data);
    if (response?.inserted_id) {
      toast('Create success', { color: 'success' });
      await router.push(`/stocks/${response.inserted_id}`);
    }
  } catch (error) {
    const errorResponse = handleError(error);
    if (errorResponse.errors) {
      form.errors = errorResponse.errors;
    }
    if (errorResponse.message) {
      toast(errorResponse.message, {
        lists: errorResponse.lists,
        color: 'danger',
      });
    }
  } finally {
    isSaving.value = false;
  }
};

const onSave = async () => {
  try {
    isSaving.value = true;
    const response = await createStockApi(form.data);
    if (response?.inserted_id) {
      toast('Create success', { color: 'success' });
      await router.push(`/stocks/${response.inserted_id}`);
    }
  } catch (error) {
    const errorResponse = handleError(error);
    if (errorResponse.errors) {
      form.errors = errorResponse.errors;
    }
    if (errorResponse.message) {
      toast(errorResponse.message, {
        lists: errorResponse.lists,
        color: 'danger',
      });
    }
  } finally {
    isSaving.value = false;
  }
};
</script>

<template>
  <div class="content-container">
    <card-breadcrumbs />
    <card-form v-model:data="form.data" v-model:errors="form.errors" v-model:is-saving="isSaving" />
    <card-buying v-model:data="form.data" v-model:errors="form.errors" v-model:is-saving="isSaving" />
    <card-selling v-model:data="form.data" v-model:errors="form.errors" v-model:is-saving="isSaving" />
    <div class="flex flex-col-reverse gap-2 md:grid md:grid-cols-2">
      <card-internal-notes v-model:data="form.data" v-model:errors="form.errors" v-model:is-saving="isSaving" />
      <card-total v-model:data="form.data" v-model:errors="form.errors" v-model:is-saving="isSaving" />
    </div>
    <div class="flex gap-2">
      <base-button class="flex-1" :is-loading="isSaving" color="danger" @click="onSaveAsDraft">Save as Draft</base-button>
      <base-button class="flex-1" :is-loading="isSaving" color="primary" @click="onSave">Save</base-button>
    </div>
  </div>
</template>
