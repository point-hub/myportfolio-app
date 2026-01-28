<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import AppContainer from '@/components/app-container.vue';
import { findBrokerApi } from '@/composables/api/master/brokers/find-by-id.api';
import { updateBrokerApi } from '@/composables/api/master/brokers/update.api';
import router from '@/router';
import { toast } from '@/toast';
import { handleError } from '@/utils/api';

import CardBreadcrumbs from './card-breadcrumbs.vue';
import CardForm from './card-form.vue';
import CardInternalNotes from './card-internal-notes.vue';
import CardReason from './card-reason.vue';
import { useForm } from './form';

const form = useForm();
const route = useRoute();

const isLoading = ref(false);
const isSaving = ref(false);

onMounted(async () => {
  try {
    isLoading.value = true;
    const response = await findBrokerApi(route.params.id as string);
    if (response) {
      form.data.code = response.code;
      form.data.name = response.name;
      form.data.branch = response.branch;
      form.data.address = response.address;
      form.data.phone = response.phone;
      form.data.account_number = response.account_number;
      form.data.account_name = response.account_name;
      form.data.notes = response.notes;
    }
  } catch (error) {
    const errorResponse = handleError(error);
    if (errorResponse.message) {
      toast(errorResponse.message, {
        lists: errorResponse.lists,
        color: 'danger',
      });
    }
  } finally {
    isLoading.value = false;
  }
});

const update = async () => {
  try {
    isSaving.value = true;
    const response = await updateBrokerApi(route.params.id as string, form.data);
    if (response?.matched_count) {
      toast('Update success', { color: 'success' });
      await router.push(`/master/brokers/${route.params.id}`);
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
      form.errors.update_reason = errorResponse.errors.update_reason || [];
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
  <app-container :is-loading="isLoading">
    <card-breadcrumbs />

    <card-form v-model:data="form.data" v-model:errors="form.errors" v-model:is-saving="isSaving" />
    <card-internal-notes v-model:data="form.data" v-model:errors="form.errors" v-model:is-saving="isSaving" />
    <card-reason v-model:data="form.data" v-model:errors="form.errors" v-model:is-saving="isSaving" />
    <div class="flex gap-2">
      <base-button class="flex-1" :is-loading="isSaving" color="primary" @click="update">Update</base-button>
    </div>
  </app-container>
</template>
