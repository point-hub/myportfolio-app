<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { findStockApi } from '@/composables/api/stocks/find-by-id.api';
import { updateStockApi } from '@/composables/api/stocks/update.api';
import { updateDraftStockApi } from '@/composables/api/stocks/update-draft.api';
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

const route = useRoute();

const form = useForm();

const isSaving = ref(false);
const isLoading = ref(false);

onMounted(async () => {
  try {
    isLoading.value = true;
    const response = await findStockApi(route.params.id as string);
    if (response) {
      form.data._id = response._id;
      form.data.form_number = response.form_number;
      form.data.transaction_date = response.transaction_date;
      form.data.settlement_date = response.settlement_date;
      form.data.broker_id = response.broker_id;
      form.data.broker = response.broker;
      form.data.transaction_number = response.transaction_number!;
      form.data.owner_id = response.owner_id;
      form.data.owner = response.owner;
      form.data.buying_list = response.buying_list ?? [];
      form.data.selling_list = response.selling_list ?? [];
      form.data.buying_total = response.buying_total;
      form.data.buying_brokerage_fee = response.buying_brokerage_fee;
      form.data.buying_vat = response.buying_vat;
      form.data.buying_levy = response.buying_levy;
      form.data.buying_kpei = response.buying_kpei;
      form.data.buying_stamp = response.buying_stamp;
      form.data.buying_proceed = response.buying_proceed;
      form.data.selling_total = response.selling_total;
      form.data.selling_brokerage_fee = response.selling_brokerage_fee;
      form.data.selling_vat = response.selling_vat;
      form.data.selling_levy = response.selling_levy;
      form.data.selling_kpei = response.selling_kpei;
      form.data.selling_stamp = response.selling_stamp;
      form.data.selling_proceed = response.selling_proceed;
      form.data.proceed_amount = response.proceed_amount;
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
    const response = await updateStockApi(route.params.id as string, form.data);
    if (response?.matched_count) {
      toast('Update success', { color: 'success' });
      await router.push(`/stocks/${route.params.id}`);
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
    const response = await updateDraftStockApi(route.params.id as string, form.data);
    if (response?.matched_count) {
      toast('Update success', { color: 'success' });
      await router.push(`/stocks/${route.params.id}`);
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
      <base-button class="flex-1" v-if="form.data.status === 'draft'" :is-loading="isSaving" color="danger" @click="onUpdateDraft">Update as Draft</base-button>
      <base-button class="flex-1" :is-loading="isSaving" color="primary" @click="onUpdate">Update</base-button>
    </div>
  </div>
</template>
