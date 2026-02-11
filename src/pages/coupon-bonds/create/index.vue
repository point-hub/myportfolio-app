<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { createCouponBondApi } from '@/composables/api/bonds/create-coupon.api';
import { findBondApi } from '@/composables/api/bonds/find-by-id.api';
import router from '@/router';
import { toast } from '@/toast';
import { handleError } from '@/utils/api';

import CardBreadcrumbs from './card-breadcrumbs.vue';
import CardBuy from './card-buy.vue';
import CardCoupon from './card-coupon.vue';
import CardForm from './card-form.vue';
import CardInternalNotes from './card-internal-notes.vue';
import CardReceiveCoupon from './card-receive-coupon.vue';
import { useForm } from './form';

const route = useRoute();
const form = useForm();

const isSaving = ref(false);
const isLoading = ref(false);
const isTabCoupon = ref(true);

onMounted(async () => {
  try {
    isLoading.value = true;
    const response = await findBondApi(route.params.id as string);
    if (response) {
      form.data._id = response._id;
      form.data.form_number = response.form_number;
      form.data.product = response.product;
      form.data.year_issued = response.year_issued;
      form.data.publisher = response.publisher;
      form.data.type = response.type;
      form.data.series = response.series;
      form.data.bank_source = response.bank_source;
      form.data.bank_source_id = response.bank_source_id;
      form.data.bank_source_account_uuid = response.bank_source_account_uuid;
      form.data.bank_placement = response.bank_placement;
      form.data.bank_placement_id = response.bank_placement_id;
      form.data.bank_placement_account_uuid = response.bank_placement_account_uuid;
      form.data.owner_id = response.owner_id;
      form.data.owner = response.owner;
      form.data.base_date = response.base_date;
      form.data.transaction_date = response.transaction_date;
      form.data.settlement_date = response.settlement_date;
      form.data.maturity_date = response.maturity_date;
      form.data.transaction_number = response.transaction_number;
      form.data.price = response.price;
      form.data.principal_amount = response.principal_amount;
      form.data.proceed_amount = response.proceed_amount;
      form.data.accrued_interest = response.accrued_interest;
      form.data.total_proceed = response.total_proceed;
      form.data.coupon_tenor = response.coupon_tenor;
      form.data.coupon_rate = response.coupon_rate;
      form.data.coupon_gross_amount = response.coupon_gross_amount;
      form.data.coupon_tax_rate = response.coupon_tax_rate;
      form.data.coupon_tax_amount = response.coupon_tax_amount;
      form.data.coupon_net_amount = response.coupon_net_amount;
      form.data.coupon_date = response.coupon_date;
      form.data.received_coupons = response.received_coupons ?? [];
      form.data.is_archived = response.is_archived;
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

const onSave = async () => {
  try {
    isSaving.value = true;
    const response = await createCouponBondApi(`${route.params.id}`, form.data);
    if (response?.matched_count) {
      toast('Create coupon success', { color: 'success' });
      await router.push('/coupon-bonds');
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
    <base-card class="py-3! gap-0!">
      <div class="flex gap-2 overflow-auto scrollbar-hidden">
        <base-button @click="isTabCoupon = false" :class="{
          'bg-primary text-white': !isTabCoupon,
          'bg-info text-white': isTabCoupon
        }" size="sm" class="font-bold"
        >
          <base-icon icon="i-fa7-solid:file" /> INFORMATION
        </base-button>
        <base-button @click="isTabCoupon = true" :class="{
          'bg-primary text-white': isTabCoupon,
          'bg-info text-white': !isTabCoupon
        }
        " size="sm" class="font-bold"
        >
          <base-icon icon="i-fa7-solid:file" /> RECEIVAL
        </base-button>
      </div>
    </base-card>
    <template v-if="!isTabCoupon">
      <card-form v-model:data="form.data" v-model:errors="form.errors" v-model:is-saving="isSaving" />
      <card-buy v-model:data="form.data" v-model:errors="form.errors" v-model:is-saving="isSaving" />
      <card-coupon v-model:data="form.data" v-model:errors="form.errors" v-model:is-saving="isSaving" />
      <card-internal-notes v-model:data="form.data" v-model:errors="form.errors" v-model:is-saving="isSaving" />
    </template>
    <template v-else>
      <card-receive-coupon v-model:data="form.data" v-model:errors="form.errors" v-model:is-saving="isSaving" />
      <div class="flex gap-2">
        <base-button class="flex-1" :is-loading="isSaving" color="primary" @click="onSave">Save</base-button>
      </div>
    </template>
  </div>
</template>
