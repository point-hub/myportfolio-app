<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import AppContainer from '@/components/app-container.vue';
import { extendInsuranceApi } from '@/composables/api/insurances/extend.api';
import { findInsuranceApi } from '@/composables/api/insurances/find-by-id.api';
import router from '@/router';
import { toast } from '@/toast';
import { handleError } from '@/utils/api';

import CardBreadcrumbs from './card-breadcrumbs.vue';
import CardCashback from './card-cashback.vue';
import CardForm from './card-form.vue';
import CardInterest from './card-interest.vue';
import CardInternalNotes from './card-internal-notes.vue';
import CardPlacement from './card-placement.vue';
import CardReason from './card-reason.vue';
import CardSource from './card-source.vue';
import { useForm } from './form';

const form = useForm();
const route = useRoute();

const isLoading = ref(false);
const isSaving = ref(false);

onMounted(async () => {
  try {
    isLoading.value = true;
    const response = await findInsuranceApi(route.params.id as string);
    if (response) {
      form.data._id = response._id;
      form.data.group_id = response.group_id;
      form.data.group = response.group;
      form.data.owner_id = response.owner_id;
      form.data.owner = response.owner;
      form.data.placement = response.placement!;
      form.data.source = {
        bank_id: response.source?.bank_id,
        bank_account_uuid: response.source?.bank_account_uuid,
      };
      form.data.interest = response.interest!;
      form.data.interest_schedule = [];
      form.data.cashback = response.cashback!;
      form.data.cashback_schedule = [];
      form.data.notes = response.notes;
      form.data.is_archived = response.is_archived;

      if (response.status === 'withdrawn') {
        form.data.placement.amount! -= response.withdrawal?.received_amount ?? 0;
      }
      if (form.data.interest.is_rollover) {
        form.data.placement.amount! += form.data.interest.net_amount ?? 0;
      }
      form.data.placement.date = form.data.placement.maturity_date;
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

const onSave = async () => {
  try {
    isSaving.value = true;
    const response = await extendInsuranceApi(`${route.params.id}`, form.data);
    if (response?.inserted_id) {
      toast('Extend success', { color: 'success' });
      await router.push(`/insurances/${response?.inserted_id}`);
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
  <app-container :is-loading="isLoading">
    <card-breadcrumbs />
    <card-form v-model:data="form.data" v-model:errors="form.errors" v-model:is-saving="isSaving" />
    <card-placement v-model:data="form.data" v-model:errors="form.errors" v-model:is-saving="isSaving" />
    <card-source v-model:data="form.data" v-model:errors="form.errors" v-model:is-saving="isSaving" />
    <card-interest v-model:data="form.data" v-model:errors="form.errors" v-model:is-saving="isSaving" />
    <card-cashback v-model:data="form.data" v-model:errors="form.errors" v-model:is-saving="isSaving" />
    <card-internal-notes v-model:data="form.data" v-model:errors="form.errors" v-model:is-saving="isSaving" />
    <card-reason v-model:data="form.data" v-model:errors="form.errors" v-model:is-saving="isSaving" />
    <div class="flex gap-2">
      <base-button class="flex-1" :is-loading="isSaving" color="primary" @click="onSave">Save</base-button>
    </div>
  </app-container>
</template>
