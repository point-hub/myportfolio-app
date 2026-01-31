<script setup lang="ts">
import { ref } from 'vue';

import { createDepositApi } from '@/composables/api/deposits/create.api';
import { draftDepositApi } from '@/composables/api/deposits/draft.api';
import router from '@/router';
import { toast } from '@/toast';
import { handleError } from '@/utils/api';

import CardBreadcrumbs from './card-breadcrumbs.vue';
import CardCashback from './card-cashback.vue';
import CardForm from './card-form.vue';
import CardInterest from './card-interest.vue';
import CardInternalNotes from './card-internal-notes.vue';
import CardPlacement from './card-placement.vue';
import CardSource from './card-source.vue';
import { useForm } from './form';

const form = useForm();

const isSaving = ref(false);

const onSaveAsDraft = async () => {
  try {
    isSaving.value = true;
    const response = await draftDepositApi(form.data);
    if (response?.inserted_id) {
      toast('Create success', { color: 'success' });
      await router.push(`/deposits/${response.inserted_id}`);
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
    const response = await createDepositApi(form.data);
    if (response?.inserted_id) {
      toast('Create success', { color: 'success' });
      await router.push(`/deposits/${response.inserted_id}`);
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
    <card-placement v-model:data="form.data" v-model:errors="form.errors" v-model:is-saving="isSaving" />
    <card-source v-model:data="form.data" v-model:errors="form.errors" v-model:is-saving="isSaving" />
    <card-interest v-model:data="form.data" v-model:errors="form.errors" v-model:is-saving="isSaving" />
    <card-cashback v-model:data="form.data" v-model:errors="form.errors" v-model:is-saving="isSaving" />
    <card-internal-notes v-model:data="form.data" v-model:errors="form.errors" v-model:is-saving="isSaving" />
    <div class="flex gap-2">
      <base-button class="flex-1" :is-loading="isSaving" color="danger" @click="onSaveAsDraft">Save as Draft</base-button>
      <base-button class="flex-1" :is-loading="isSaving" color="primary" @click="onSave">Save</base-button>
    </div>
  </div>
</template>
