<script setup lang="ts">
import { computed, watchEffect } from 'vue';

import { roundNumber } from '@/utils/number';

import { type IForm } from './form';

const data = defineModel<IForm>('data', {
  default: () => ({
    coupon_tenor: undefined,
    coupon_gross_amount: undefined,
    coupon_rate: undefined,
    coupon_tax_rate: undefined,
    coupon_tax_amount: undefined,
    coupon_net_amount: undefined,
    received_coupons: {
      date: undefined,
      amount: undefined,
      received_date: undefined,
      received_amount: undefined,
      remaining_amount: undefined,
      bank_id: undefined,
      bank_account_uuid: undefined,
    },
  }),
});

const nextCouponDate = computed(() => {
  const base = new Date(data.value.maturity_date as string);
  base.setDate(base.getDate() + Number(data.value.coupon_tenor ?? 0));

  return base.toISOString().slice(0, 10);
});

watchEffect(() => {
  data.value.coupon_gross_amount = roundNumber((data.value.principal_amount ?? 0) * (data.value.coupon_rate ?? 0) / (data.value.base_date ?? 0) * (data.value.coupon_tenor ?? 0), 2);
  data.value.coupon_tax_amount = roundNumber((data.value.coupon_tax_rate ?? 0) / 100 * data.value.coupon_gross_amount, 2);
  data.value.coupon_net_amount = data.value.coupon_gross_amount - data.value.coupon_tax_amount;

  data.value.received_coupons?.forEach((el) => {
    el.remaining_amount = el.amount - el.received_amount;
  });
});
</script>

<template>
  <base-card title="Coupon Information">
    <div class="flex flex-col gap-4">
      <base-input-number layout="horizontal" label="Coupon Tenor" align="left" :model-value="data.coupon_tenor" disabled />
      <base-input-number layout="horizontal" label="Gross Coupon" align="left" :model-value="data.coupon_gross_amount" disabled />
      <base-input-number layout="horizontal" label="Tax Rate" align="left" :model-value="data.coupon_tax_rate" disabled />
      <base-input-number layout="horizontal" label="Tax Amount" align="left" :model-value="data.coupon_tax_amount" disabled />
      <base-input-number layout="horizontal" label="Net Amount" align="left" :model-value="data.coupon_net_amount" disabled />
      <base-input layout="horizontal" label="Next Coupon Date" align="left" :model-value="nextCouponDate" disabled />

      <!-- <base-table class="min-h-48">
        <thead>
          <tr>
            <th class="w-1">No</th>
            <th>Date</th>
            <th class="text-right whitespace-nowrap w-1">Amount</th>
            <th>Received Bank</th>
            <th>Received Date</th>
            <th class="text-right whitespace-nowrap w-1">Received Amount</th>
            <th class="text-right whitespace-nowrap w-1">Remaining Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(receivedCoupon, index) in data?.received_coupons">
            <td class="text-center">{{ index + 1 }}</td>
            <td class="whitespace-nowrap">{{ receivedCoupon.date }}</td>
            <td><base-input-number v-model="receivedCoupon.amount" :disabled="isSaving" decimal-length="2" border="none" paddingless /></td>
            <td>
              <base-choosen
                title="Bank Account"
                v-model="receivedCoupon.bank_account_uuid"
                v-model:search="searchBank"
                :options="bankOptions"
                @select="(selected: IBankAccountOption) => onSelectedBank(selected, receivedCoupon)"
                :disabled="isSaving"
                placeholder="Select"
                type="text"
              />
            </td>
            <td><base-datepicker v-model="receivedCoupon.received_date" :disabled="isSaving" border="none" /></td>
            <td><base-input-number v-model="receivedCoupon.received_amount" :disabled="isSaving" decimal-length="2" border="none" paddingless /></td>
            <td><base-input-number v-model="receivedCoupon.remaining_amount" disabled decimal-length="2" border="none" paddingless allow-negative /></td>
          </tr>
          <tr>
            <td></td>
            <td></td>
            <td class="text-right">{{ formatNumber(totalAmount, 2) }}</td>
            <td></td>
            <td></td>
            <td class="text-right">{{ formatNumber(totalReceived, 2) }}</td>
            <td class="text-right">{{ formatNumber(totalRemaining, 2) }}</td>
          </tr>
        </tbody>
      </base-table> -->
    </div>
  </base-card>
</template>

<style scoped lang="postcss"></style>
