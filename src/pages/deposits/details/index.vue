<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import AppContainer from '@/components/app-container.vue';
import StatusBanner from '@/components/status-banner.vue';
import { findDepositApi } from '@/composables/api/deposits/find-by-id.api';
import { toast } from '@/toast';
import { handleError } from '@/utils/api';

import CardActions from '../components/card-actions.vue';
import CardBreadcrumbs from './card-breadcrumbs.vue';
import CardCashback from './card-cashback.vue';
import CardForm from './card-form.vue';
import CardInterest from './card-interest.vue';
import CardInternalNotes from './card-internal-notes.vue';
import CardPlacement from './card-placement.vue';
import CardSource from './card-source.vue';
import { useForm } from './form';

const route = useRoute();
const form = useForm();

const isLoading = ref(false);

onMounted(async () => {
  try {
    isLoading.value = true;
    const response = await findDepositApi(route.params.id as string);
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

    <base-card v-if="!form.data._id">
      Data Not Found
    </base-card>
    <template v-else>
      <card-form v-model:data="form.data" />
      <card-placement v-model:data="form.data" />
      <card-source v-model:data="form.data" />
      <card-interest v-model:data="form.data" />
      <card-cashback v-model:data="form.data" />
      <card-internal-notes v-model:data="form.data" />
    </template>
  </app-container>
</template>
