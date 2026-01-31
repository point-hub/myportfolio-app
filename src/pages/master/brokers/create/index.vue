<script setup lang="ts">
import { ref } from 'vue';

import { createBrokerApi } from '@/composables/api/master/brokers/create.api';
import router from '@/router';
import { toast } from '@/toast';
import { handleError } from '@/utils/api';

import CardAccounts from './card-accounts.vue';
import CardBreadcrumbs from './card-breadcrumbs.vue';
import CardForm from './card-form.vue';
import CardInternalNotes from './card-internal-notes.vue';
import { useForm } from './form';

const form = useForm();

const isSaving = ref(false);

const save = async () => {
  try {
    isSaving.value = true;
    const response = await createBrokerApi(form.data);
    if (response?.inserted_id) {
      toast('Create success', { color: 'success' });
      await router.push(`/master/brokers/${response.inserted_id}`);
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
    <card-accounts v-model:data="form.data" />
    <card-internal-notes v-model:data="form.data" v-model:errors="form.errors" v-model:is-saving="isSaving" />
    <div class="flex gap-2">
      <base-button class="flex-1" :is-loading="isSaving" color="primary" @click="save">Save</base-button>
    </div>
  </div>
</template>
