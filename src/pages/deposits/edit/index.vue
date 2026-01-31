<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import AppContainer from '@/components/app-container.vue';
import { findDepositApi } from '@/composables/api/deposits/find-by-id.api';
import { updateDepositApi } from '@/composables/api/deposits/update.api';
import { updateDraftDepositApi } from '@/composables/api/deposits/update-draft.api';
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
    const response = await findDepositApi(route.params.id as string);
    if (response) {
      form.data._id = response._id;
      form.data.form_number = response.form_number;
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
      form.data.interest_schedule = response.interest_schedule ?? [];
      form.data.cashback = response.cashback!;
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

const onUpdate = async () => {
  try {
    isSaving.value = true;
    const response = await updateDepositApi(route.params.id as string, form.data);
    if (response?.matched_count) {
      toast('Update success', { color: 'success' });
      await router.push(`/deposits/${route.params.id}`);
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
    const response = await updateDraftDepositApi(route.params.id as string, form.data);
    if (response?.matched_count) {
      toast('Update success', { color: 'success' });
      await router.push(`/deposits/${route.params.id}`);
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
      <base-button class="flex-1" :is-loading="isSaving" color="danger" @click="onUpdateDraft">Update as Draft</base-button>
      <base-button class="flex-1" :is-loading="isSaving" color="primary" @click="onUpdate">Update</base-button>
    </div>
  </app-container>
</template>
