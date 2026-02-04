<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { findDividendStockApi } from '@/composables/api/dividend-stocks/find-by-id.api';
import { updateDividendStockApi } from '@/composables/api/dividend-stocks/update.api';
import { updateDraftDividendStockApi } from '@/composables/api/dividend-stocks/update-draft.api';
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
    const response = await findDividendStockApi(route.params.id as string);
    if (response) {
      form.data._id = response._id;
      form.data.form_number = response.form_number;
      form.data.dividend_date = response.dividend_date;
      form.data.broker_id = response.broker_id;
      form.data.broker = response.broker;
      form.data.bank_id = response.bank_id;
      form.data.bank_account_uuid = response.bank_account_uuid;
      form.data.bank = response.bank;
      form.data.transactions = response.transactions;
      form.data.total_received = response.total_received;
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
    const response = await updateDividendStockApi(route.params.id as string, form.data);
    if (response?.matched_count) {
      toast('Update success', { color: 'success' });
      await router.push(`/dividend-stocks/${route.params.id}`);
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
    const response = await updateDraftDividendStockApi(route.params.id as string, form.data);
    if (response?.matched_count) {
      toast('Update success', { color: 'success' });
      await router.push(`/dividend-stocks/${route.params.id}`);
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
