<script setup lang="ts">
import { computed, ref, watch } from 'vue';

import BaseConfirmActionModal from '@/components/base-confirm-action-modal.vue';
import { deleteInterestDepositApi } from '@/composables/api/deposits/delete-interest.api';
import { receiveInterestDepositApi } from '@/composables/api/deposits/receive-interest.api';
import { useSelectableBankAccounts } from '@/composables/selectable/bank-accounts';
import { toast } from '@/toast';
import { handleError } from '@/utils/api';
import { roundNumber } from '@/utils/number';

interface IData {
  _id?: string
  uuid?: string
  payment_date?: string
  amount?: number
  received_date?: string
  received_amount?: number
  received_additional_payment_date?: string
  received_additional_payment_amount?: number
  bank_id?: string
  bank_account_uuid?: string
  additional_bank_id?: string
  additional_bank_account_uuid?: string
  readonly?: boolean
}

const confirmActionModalRef = ref();
const data = ref<IData>({
  _id: undefined,
  uuid: undefined,
  payment_date: undefined,
  amount: undefined,
  received_date: undefined,
  received_amount: undefined,
  received_additional_payment_date: undefined,
  received_additional_payment_amount: undefined,
  bank_id: undefined,
  bank_account_uuid: undefined,
  additional_bank_id: undefined,
  additional_bank_account_uuid: undefined,
  readonly: false,
});
const readonly = ref(false);

const errors = ref<{ [key: string]: string[]; }>({
  received_date: [],
  received_amount: [],
  bank_id: [],
  bank_account_uuid: [],
  additional_received_date: [],
  additional_received_amount: [],
  additional_bank_id: [],
  additional_bank_account_uuid: [],
});
const emit = defineEmits(['received']);
const toggleModal = (updateData: IData) => {
  console.log(updateData);
  reset();
  data.value = updateData;
  confirmActionModalRef.value.toggleModal();
};

const isReceiving = ref(false);
const onReceive = async () => {
  // prevent calling twice use loading state
  if (isReceiving.value) return;
  isReceiving.value = true;

  try {
    await receiveInterestDepositApi(data.value._id as string, {
      uuid: data.value?.uuid,
      received_date: data.value?.received_date,
      received_amount: data.value?.received_amount,
      received_additional_payment_date: data.value?.received_additional_payment_date,
      received_additional_payment_amount: data.value?.received_additional_payment_amount,
      bank_id: data.value?.bank_id,
      bank_account_uuid: data.value?.bank_account_uuid,
      additional_bank_id: data.value?.additional_bank_id,
      additional_bank_account_uuid: data.value?.additional_bank_account_uuid,
    });
    toast('Receive interest success', { color: 'success' });
    emit('received');
    reset();
    confirmActionModalRef.value.toggleModal(false);
  } catch (error) {
    const errorResponse = handleError(error);
    if(errorResponse.errors) {
      errors.value = errorResponse.errors;
    }
    if (errorResponse.message) {
      toast(errorResponse.message, {
        lists: errorResponse.lists,
        color: 'danger',
      });
    }
  } finally {
    // stop loading state
    isReceiving.value = false;
  }
};

const onDelete = async () => {
  // prevent calling twice use loading state
  if (isReceiving.value) return;
  isReceiving.value = true;

  try {
    await deleteInterestDepositApi(data.value._id as string, {
      uuid: data.value?.uuid,
    });
    toast('Delete interest success', { color: 'success' });
    emit('received');
    reset();
    confirmActionModalRef.value.toggleModal(false);
  } catch (error) {
    const errorResponse = handleError(error);
    if(errorResponse.errors) {
      errors.value = errorResponse.errors;
    }
    if (errorResponse.message) {
      toast(errorResponse.message, {
        lists: errorResponse.lists,
        color: 'danger',
      });
    }
  } finally {
    // stop loading state
    isReceiving.value = false;
  }
};

const remainingAmount = computed(() => {
  return roundNumber((data.value?.amount ?? 0)
  - (data.value?.received_amount ?? 0)
  - (data.value?.received_additional_payment_amount ?? 0), 2);
});

const { options: bankOptions, searchBank } = useSelectableBankAccounts();
watch(() => [data.value?.bank_account_uuid, bankOptions.value], () => {
  const selected = bankOptions.value.find(o => o.value === data.value?.bank_account_uuid);
  if (data.value && selected?.bank_id) {
    data.value.bank_id = selected.bank_id;
  }
});

const { options: additionalBankOptions, searchBank: searchAdditionalBank } = useSelectableBankAccounts();
watch(() => [data.value?.additional_bank_account_uuid, additionalBankOptions.value], () => {
  const selected = additionalBankOptions.value.find(o => o.value === data.value?.additional_bank_account_uuid);
  if (data.value && selected?.bank_id) {
    data.value.additional_bank_id = selected.bank_id;
  }
});

const reset = () => {
  isAddAdditionalPayment.value = false;
  data.value = {
    _id: undefined,
    uuid: undefined,
    payment_date: undefined,
    amount: undefined,
    received_date: undefined,
    received_amount: undefined,
    received_additional_payment_date: undefined,
    received_additional_payment_amount: undefined,
    bank_id: undefined,
    bank_account_uuid: undefined,
    additional_bank_id: undefined,
    additional_bank_account_uuid: undefined,
    readonly: undefined,
  };
  errors.value = {
    received_date: [],
    received_amount: [],
    bank_id: [],
    bank_account_uuid: [],
  };
};

const isAddAdditionalPayment = ref(false);
const onAddAdditionalPayment = () => {
  isAddAdditionalPayment.value = true;
};

defineExpose({
  toggleModal,
  isReceiving,
});
</script>

<template>
  <base-confirm-action-modal
    ref="confirmActionModalRef"
    title="Receive Interest"
  >
    <div class="flex flex-col gap-4">
      <base-datepicker layout="v" label="Payment Date" v-model="data.payment_date" disabled />
      <base-input-number layout="v" label="Payment Amount" align="left" v-model="data.amount" disabled decimal-length="2" />
      <hr class="border-slate-300 dark:border-slate-600"  />
      <base-select
        layout="v"
        label="Bank"
        required
        v-model="data.bank_account_uuid"
        v-model:search="searchBank"
        :errors="errors.bank_account_uuid"
        :options="bankOptions"
        :disabled="isReceiving || readonly"
        placeholder="Select"
      />
      <base-datepicker layout="v" label="Received Date" required v-model="data.received_date" :errors="errors.received_date" :disabled="isReceiving || readonly" />
      <base-input-number layout="v" label="Received Amount" required align="left" v-model="data.received_amount" :errors="errors.received_amount" :disabled="isReceiving || readonly" decimal-length="2" />
      <hr class="border-slate-300 dark:border-slate-600"  />
      <base-select
        layout="v"
        label="Bank (Additional Payment)"
        v-if="isAddAdditionalPayment"
        v-model="data.additional_bank_account_uuid"
        v-model:search="searchAdditionalBank"
        :errors="errors.additional_bank_account_uuid"
        :options="additionalBankOptions"
        :disabled="isReceiving || readonly"
        placeholder="Select"
      />
      <base-datepicker v-if="isAddAdditionalPayment" layout="v" label="Received Additional Payment Date" v-model="data.received_additional_payment_date" :errors="errors.additional_received_date" :disabled="isReceiving || readonly" />
      <base-input-number v-if="isAddAdditionalPayment" layout="v" label="Received Additional Payment Amount" align="left" v-model="data.received_additional_payment_amount" :errors="errors.additional_received_amount" :disabled="isReceiving || readonly" decimal-length="2" />
      <base-input-number layout="v" label="Remaining Amount" align="left" :model-value="remainingAmount" disabled decimal-length="2" allow-negative />
    </div>
    <template #action>
      <base-button v-if="!readonly" variant="filled" color="primary" @click="onReceive">Confirm</base-button>
      <base-button variant="filled" color="danger" @click="onDelete">Delete</base-button>
      <base-button v-if="!readonly && !isAddAdditionalPayment" variant="filled" color="info" @click="onAddAdditionalPayment">Add Additional Payment</base-button>
      <base-button variant="filled" color="secondary" @click="confirmActionModalRef.toggleModal(false)">Close</base-button>
    </template>
  </base-confirm-action-modal>
</template>
