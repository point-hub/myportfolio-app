<script setup lang="ts">
import { ref } from 'vue';

import { createBankApi } from '@/composables/api/master/banks/create.api';
import router from '@/router';
import { toast } from '@/toast';
import { handleError } from '@/utils/api';

import CardBreadcrumbs from './card-breadcrumbs.vue';
import CardForm from './card-form.vue';
import CardInternalNotes from './card-internal-notes.vue';
import { useForm } from './form';

const form = useForm();

const isSaving = ref(false);

const save = async () => {
  try {
    isSaving.value = true;
    const response = await createBankApi(form.data);
    if (response?.inserted_id) {
      toast('Create success', { color: 'success' });
      await router.push(`/master/banks/${response.inserted_id}`);
    }
  } catch (error) {
    const errorResponse = handleError(error);
    if (errorResponse.errors) {
      form.errors.code = errorResponse.errors.code || [];
      form.errors.name = errorResponse.errors.name || [];
      form.errors.branch = errorResponse.errors.branch || [];
      form.errors.address = errorResponse.errors.address || [];
      form.errors.phone = errorResponse.errors.phone || [];
      form.errors.account_number = errorResponse.errors.account_number || [];
      form.errors.account_name = errorResponse.errors.account_name || [];
      form.errors.notes = errorResponse.errors.notes || [];
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
    <card-internal-notes v-model:data="form.data" v-model:errors="form.errors" v-model:is-saving="isSaving" />
    <div class="flex gap-2">
      <base-button class="flex-1" :is-loading="isSaving" color="primary" @click="save">Save</base-button>
    </div>
  </div>
</template>
