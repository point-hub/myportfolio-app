<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { findPaymentStockApi } from '@/composables/api/payment-stocks/find-by-id.api';
import { updatePaymentStockApi } from '@/composables/api/payment-stocks/update.api';
import { updateDraftPaymentStockApi } from '@/composables/api/payment-stocks/update-draft.api';
import router from '@/router';
import { toast } from '@/toast';
import { handleError } from '@/utils/api';

import CardBreadcrumbs from './card-breadcrumbs.vue';
import CardForm from './card-form.vue';
import CardInternalNotes from './card-internal-notes.vue';
import CardTransactions from './card-transactions.vue';
import { useForm } from './form';

const route = useRoute();

const form = useForm();

const isSaving = ref(false);
const isLoading = ref(false);

onMounted(async () => {
  try {
    isLoading.value = true;
    const response = await findPaymentStockApi(route.params.id as string);
    if (response) {
      form.data._id = response._id;
      form.data.form_number = response.form_number;
      form.data.payment_date = response.payment_date;
      form.data.broker_id = response.broker_id;
      form.data.broker = response.broker;
      form.data.transactions = response.transactions;
      form.data.total = response.total;
      form.data.notes = response.notes;
      form.data.status = response.status;
      form.data.is_archived = response.is_archived;
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

const onUpdate = async () => {
  try {
    isSaving.value = true;
    const response = await updatePaymentStockApi(route.params.id as string, form.data);
    if (response?.matched_count) {
      toast('Update success', { color: 'success' });
      await router.push(`/payment-stocks/${route.params.id}`);
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

const onUpdateDraft = async () => {
  try {
    isSaving.value = true;
    const response = await updateDraftPaymentStockApi(route.params.id as string, form.data);
    if (response?.matched_count) {
      toast('Update success', { color: 'success' });
      await router.push(`/payment-stocks/${route.params.id}`);
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
    <card-transactions v-model:data="form.data" v-model:errors="form.errors" v-model:is-saving="isSaving" />
    <card-internal-notes v-model:data="form.data" v-model:errors="form.errors" v-model:is-saving="isSaving" />
    <div class="flex gap-2">
      <base-button class="flex-1" v-if="form.data.status === 'draft'" :is-loading="isSaving" color="danger" @click="onUpdateDraft">Update as Draft</base-button>
      <base-button class="flex-1" :is-loading="isSaving" color="primary" @click="onUpdate">Update</base-button>
    </div>
  </div>
</template>
