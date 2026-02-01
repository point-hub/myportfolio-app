<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import AppContainer from '@/components/app-container.vue';
import StatusBanner from '@/components/status-banner.vue';
import { findInsuranceApi } from '@/composables/api/insurances/find-by-id.api';
import { toast } from '@/toast';
import { handleError } from '@/utils/api';

import CardActions from '../components/card-actions.vue';
import CardBreadcrumbs from './card-breadcrumbs.vue';
import CardCashback from './card-cashback.vue';
import CardForm from './card-form.vue';
import CardInterest from './card-interest.vue';
import CardInternalNotes from './card-internal-notes.vue';
import CardMetadata from './card-metadata.vue';
import CardPlacement from './card-placement.vue';
import CardSource from './card-source.vue';
import CardWithdrawal from './card-withdrawal.vue';
import { useForm } from './form';

const route = useRoute();
const form = useForm();

const isLoading = ref(false);

onMounted(async () => {
  try {
    isLoading.value = true;
    const response = await findInsuranceApi(route.params.id as string);
    if (response) {
      form.data._id = response._id;
      form.data.form_number = response.form_number;
      form.data.group = response.group;
      form.data.owner = response.owner;
      form.data.placement = response.placement;
      form.data.source = response.source;
      form.data.interest = response.interest;
      form.data.interest_schedule = response.interest_schedule ?? [];
      form.data.cashback = response.cashback;
      form.data.cashback_schedule = response.cashback_schedule ?? [];
      form.data.notes = response.notes;
      form.data.withdrawal = response.withdrawal;
      form.data.is_archived = response.is_archived;
      form.data.status = response.status;
      form.data.created_by = response.created_by;
      form.data.created_at = response.created_at;
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

const onReceived = async () => {
  try {
    isLoading.value = true;
    const response = await findInsuranceApi(route.params.id as string);
    if (response) {
      form.data._id = response._id;
      form.data.form_number = response.form_number;
      form.data.group = response.group;
      form.data.owner = response.owner;
      form.data.placement = response.placement;
      form.data.source = response.source;
      form.data.interest = response.interest;
      form.data.interest_schedule = response.interest_schedule ?? [];
      form.data.cashback = response.cashback;
      form.data.cashback_schedule = response.cashback_schedule ?? [];
      form.data.notes = response.notes;
      form.data.withdrawal = response.withdrawal;
      form.data.is_archived = response.is_archived;
      form.data.status = response.status;
      form.data.created_at = response.created_at;
      form.data.created_by = response.created_by;
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
};
</script>

<template>
  <app-container :is-loading="isLoading">
    <card-breadcrumbs />
    <card-actions v-model:data="form.data" @restored="onRestored" @archived="onArchived" @received="onReceived"/>

    <status-banner v-if="form.data.is_archived" status-type="danger" message="This data has been archived." />

    <status-banner v-if="form.data.status === 'draft'" status-type="danger" message="Draft." />
    <status-banner v-if="form.data.status === 'withdrawn'" status-type="success" message="Withdrawn." />

    <base-card v-if="!form.data._id">
      Data Not Found
    </base-card>
    <template v-else>
      <card-form v-model:data="form.data" />
      <card-placement v-model:data="form.data" />
      <card-source v-model:data="form.data" />
      <card-interest v-model:data="form.data" />
      <card-cashback v-model:data="form.data" />
      <card-withdrawal v-model:data="form.data" />
      <card-internal-notes v-model:data="form.data" />
      <card-metadata v-model:data="form.data" />
    </template>
  </app-container>
</template>
