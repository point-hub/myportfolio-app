<script setup lang="ts">
import { computed, ref, watch } from 'vue';

import BaseConfirmActionModal from '@/components/base-confirm-action-modal.vue';
import { receiveCashbackDepositApi } from '@/composables/api/deposits/receive-cashback.api';
import { useSelectableBankAccounts } from '@/composables/selectable/bank-accounts';
import { toast } from '@/toast';
import { handleError } from '@/utils/api';
import { roundNumber } from '@/utils/number';

const confirmActionModalRef = ref();
const _id = ref();
const paymentDate = ref();
const amount = ref();
const receivedDate = ref();
const receivedAmount = ref();
const receivedAdditionalPaymentDate = ref();
const receivedAdditionalPaymentAmount = ref();
const bankId = ref();
const bankAccountUuid = ref();
const additionalBankId = ref();
const additionalBankAccountUuid = ref();
const readonly = ref(false);

const errors = ref<{ [key: string]: string[]; }>({
  received_date: [],
  received_amount: [],
  bank_id: [],
  bank_account_uuid: [],
});
const emit = defineEmits(['received']);

interface IData {
  _id: string
  payment_date: string
  amount: number
  received_date: string
  received_amount: number
  received_additional_payment_date: string
  received_additional_payment_amount: number
  bank_id: string
  bank_account_uuid: string
  additional_bank_id: string
  additional_bank_account_uuid: string
  readonly: boolean
}
const toggleModal = (data: IData) => {
  reset();

  _id.value= data._id;
  paymentDate.value= data.payment_date;
  amount.value= data.amount;
  receivedDate.value= data.received_date;
  receivedAmount.value= data.received_amount;
  receivedAdditionalPaymentDate.value= data.received_additional_payment_date;
  receivedAdditionalPaymentAmount.value= data.received_additional_payment_amount;
  bankId.value= data.bank_id;
  bankAccountUuid.value= data.bank_account_uuid;
  additionalBankId.value= data.additional_bank_id;
  additionalBankAccountUuid.value= data.additional_bank_account_uuid;
  readonly.value = data.readonly ?? false;

  confirmActionModalRef.value.toggleModal();
};

const isReceiving = ref(false);
const onReceive = async () => {
  // prevent calling twice use loading state
  if (isReceiving.value) return;
  isReceiving.value = true;

  try {
    await receiveCashbackDepositApi(_id.value as string, {
      payment_date: paymentDate.value,
      amount: Number(amount.value),
      received_date: receivedDate.value,
      received_amount: Number(receivedAmount.value),
      received_additional_payment_date: receivedAdditionalPaymentDate.value,
      received_additional_payment_amount: Number(receivedAdditionalPaymentAmount.value),
      remaining_amount: Number(amount.value) - Number(receivedAmount.value) - Number(receivedAdditionalPaymentAmount.value),
      bank_id: bankId.value,
      bank_account_uuid: bankAccountUuid.value,
      additional_bank_id: additionalBankId.value,
      additional_bank_account_uuid: additionalBankAccountUuid.value,
    });
    toast('Receive cashback success', { color: 'success' });
    emit('received');
    reset();
    confirmActionModalRef.value.toggleModal(false);
  } catch (error) {
    const errorResponse = handleError(error);
    errors.value = errorResponse.errors!;
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
  return roundNumber((amount.value ?? 0) - (receivedAmount.value ?? 0) - (receivedAdditionalPaymentAmount.value ?? 0), 2);
});

const { options: bankOptions, searchBank } = useSelectableBankAccounts();
watch(() => [bankAccountUuid.value, bankOptions.value], () => {
  const selected = bankOptions.value.find(o => o.value === bankAccountUuid.value);
  bankId.value = selected?.bank_id;
});

const { options: additionalBankOptions, searchBank: searchAdditionalBank } = useSelectableBankAccounts();
watch(() => [additionalBankAccountUuid.value, additionalBankOptions.value], () => {
  const selected = additionalBankOptions.value.find(o => o.value === additionalBankAccountUuid.value);
  additionalBankId.value = selected?.bank_id;
});

const reset = () => {
  isAddAdditionalPayment.value = false;
  paymentDate.value = undefined;
  amount.value = undefined;
  bankId.value = undefined;
  bankAccountUuid.value = undefined;
  receivedDate.value = undefined;
  receivedAmount.value = undefined;
  receivedAdditionalPaymentDate.value = undefined;
  receivedAdditionalPaymentAmount.value = undefined;
  additionalBankId.value = undefined;
  additionalBankAccountUuid.value = undefined;
  errors.value = {
    received_date: [],
    received_amount: [],
    bank_id: [],
    bank_account_uuid: [],
    additional_received_date: [],
    additional_received_amount: [],
    additional_bank_id: [],
    additional_bank_account_uuid: [],
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
    title="Receive Cashback"
  >
    <div class="flex flex-col gap-4">
      <base-datepicker layout="v" label="Payment Date" v-model="paymentDate" disabled />
      <base-input-number layout="v" label="Payment Amount" align="left" v-model="amount" disabled decimal-length="2" />
      <hr class="border-slate-300 dark:border-slate-600"  />
      <base-select
        layout="v"
        label="Bank"
        required
        v-model:selectedValue="bankAccountUuid"
        v-model:search="searchBank"
        :errors="errors.additional_bank_account_uuid"
        :options="bankOptions"
        :disabled="isReceiving || readonly"
        placeholder="Select"
      />
      <base-datepicker layout="v" label="Received Date" required v-model="receivedDate" :errors="errors.additional_received_date" :disabled="isReceiving || readonly" />
      <base-input-number layout="v" label="Received Amount" required align="left" v-model="receivedAmount" :errors="errors.additional_received_amount" :disabled="isReceiving || readonly" decimal-length="2" />
      <hr class="border-slate-300 dark:border-slate-600"  />
      <base-select
        layout="v"
        label="Bank (Additional Payment)"
        v-if="isAddAdditionalPayment || receivedAdditionalPaymentDate"
        v-model:selectedValue="additionalBankAccountUuid"
        v-model:search="searchAdditionalBank"
        :errors="errors.bank_account_uuid"
        :options="additionalBankOptions"
        :disabled="isReceiving || readonly"
        placeholder="Select"
      />
      <base-datepicker v-if="isAddAdditionalPayment || receivedAdditionalPaymentDate" layout="v" label="Received Additional Payment Date" v-model="receivedAdditionalPaymentDate" :errors="errors.received_date" :disabled="isReceiving || readonly" />
      <base-input-number v-if="isAddAdditionalPayment || receivedAdditionalPaymentDate" layout="v" label="Received Additional Payment Amount" align="left" v-model="receivedAdditionalPaymentAmount" :errors="errors.received_amount" :disabled="isReceiving || readonly" decimal-length="2" />
      <base-input-number layout="v" label="Remaining Amount" align="left" :model-value="remainingAmount" disabled decimal-length="2" />
    </div>
    <template #action>
      <base-button v-if="!readonly" variant="filled" color="primary" @click="onReceive">Confirm</base-button>
      <base-button v-if="!readonly && !receivedAdditionalPaymentDate && !isAddAdditionalPayment" variant="filled" color="info" @click="onAddAdditionalPayment">Add Additional Payment</base-button>
      <base-button variant="filled" color="secondary" @click="confirmActionModalRef.toggleModal(false)">Close</base-button>
    </template>
  </base-confirm-action-modal>
</template>
