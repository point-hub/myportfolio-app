<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import AppContainer from '@/components/app-container.vue';
import StatusBanner from '@/components/status-banner.vue';
import { findPaymentStockApi } from '@/composables/api/payment-stocks/find-by-id.api';
import { toast } from '@/toast';
import { handleError } from '@/utils/api';

import CardActions from '../components/card-actions.vue';
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

const onArchived = async () => {
  form.data.is_archived = true;
};

const onRestored = async () => {
  form.data.is_archived = false;
};
</script>

<template>
  <app-container :is-loading="isLoading">
    <card-breadcrumbs />
    <card-actions v-model:data="form.data" @restored="onRestored" @archived="onArchived" />

    <status-banner v-if="form.data.is_archived" status-type="danger" message="This data has been archived." />
    <status-banner v-if="form.data.status === 'draft'" status-type="danger" message="Draft." />

    <base-card v-if="!form.data._id">
      Data Not Found
    </base-card>
    <template v-else>
      <card-form v-model:data="form.data" v-model:errors="form.errors" v-model:is-saving="isSaving" />
      <card-transactions v-model:data="form.data" v-model:errors="form.errors" v-model:is-saving="isSaving" />
      <card-internal-notes v-model:data="form.data" v-model:errors="form.errors" v-model:is-saving="isSaving" />
    </template>
  </app-container>
</template>
