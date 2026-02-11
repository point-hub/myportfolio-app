<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import AppContainer from '@/components/app-container.vue';
import StatusBanner from '@/components/status-banner.vue';
import { findStockApi } from '@/composables/api/stocks/find-by-id.api';
import { toast } from '@/toast';
import { handleError } from '@/utils/api';

import CardActions from '../components/card-actions.vue';
import CardBreadcrumbs from './card-breadcrumbs.vue';
import CardBuying from './card-buying.vue';
import CardForm from './card-form.vue';
import CardInternalNotes from './card-internal-notes.vue';
import CardSelling from './card-selling.vue';
import CardTotal from './card-total.vue';
import { useForm } from './form';

const route = useRoute();

const form = useForm();

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
      form.data.buying_list = response.buying_list;
      form.data.selling_list = response.selling_list;
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
      <card-form v-model:data="form.data" />
      <card-buying v-model:data="form.data" />
      <card-selling v-model:data="form.data" />
      <div class="flex flex-col-reverse gap-2 md:grid md:grid-cols-2">
        <card-internal-notes v-model:data="form.data" />
        <card-total v-model:data="form.data" />
      </div>
    </template>
  </app-container>
</template>
