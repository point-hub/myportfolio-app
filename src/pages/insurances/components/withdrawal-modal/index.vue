<script setup lang="ts">
import { computed, ref, watch } from 'vue';

import BaseConfirmActionModal from '@/components/base-confirm-action-modal.vue';
import { deleteWithdrawalInsuranceApi } from '@/composables/api/insurances/delete-withdrawal.api';
import { withdrawalInsuranceApi } from '@/composables/api/insurances/withdrawal.api';
import { useSelectableBankAccounts } from '@/composables/selectable/bank-accounts';
import { toast } from '@/toast';
import { handleError } from '@/utils/api';
import { roundNumber } from '@/utils/number';

const confirmActionModalRef = ref();
const _id = ref();
const maturityDate = ref();
const amount = ref();
const receivedDate = ref();
const receivedAmount = ref();
const bankId = ref();
const bankAccountUuid = ref();
const notes = ref();

const errors = ref<{ [key: string]: undefined | string[]; }>({
  received_date: [],
  received_amount: [],
  bank_id: [],
  bank_account_uuid: [],
  notes: [],
});
const emit = defineEmits(['received']);

interface IData {
  _id: string
  payment_date: string
  amount: number
  received_date: string
  received_amount: number
  bank_id: string
  bank_account_uuid: string
  notes: string
  readonly: boolean
}
const toggleModal = (data: IData) => {
  reset();

  _id.value= data._id;
  maturityDate.value= data.payment_date;
  amount.value= data.amount;
  receivedDate.value= data.received_date;
  receivedAmount.value= data.received_amount;
  bankId.value= data.bank_id;
  bankAccountUuid.value= data.bank_account_uuid;
  notes.value= data.notes;

  confirmActionModalRef.value.toggleModal();
};

const isReceiving = ref(false);
const onReceive = async () => {
  // prevent calling twice use loading state
  if (isReceiving.value) return;
  isReceiving.value = true;

  try {
    await withdrawalInsuranceApi(_id.value as string, {
      payment_date: maturityDate.value,
      amount: Number(amount.value),
      received_date: receivedDate.value,
      received_amount: Number(receivedAmount.value),
      remaining_amount: remainingAmount.value,
      bank_id: bankId.value,
      bank_account_uuid: bankAccountUuid.value,
      notes: notes.value,
    });
    toast('Withdrawal success', { color: 'success' });
    emit('received');
    reset();
    confirmActionModalRef.value.toggleModal(false);
  } catch (error) {
    const errorResponse = handleError(error);
    if (errorResponse.errors) {
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
    await deleteWithdrawalInsuranceApi(_id.value as string);
    toast('Delete withdrawal success', { color: 'success' });
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
  return roundNumber((amount.value ?? 0) - (receivedAmount.value ?? 0), 2);
});

const { options: bankOptions, searchBank } = useSelectableBankAccounts();
watch(() => [bankAccountUuid.value, bankOptions.value], () => {
  const selected = bankOptions.value.find(o => o.value === bankAccountUuid.value);
  bankId.value = selected?.bank_id;
});

const reset = () => {
  maturityDate.value = null;
  amount.value = null;
  bankId.value = null;
  bankAccountUuid.value = null;
  receivedDate.value = null;
  receivedAmount.value = null;
};

defineExpose({
  toggleModal,
  isReceiving,
});
</script>

<template>
  <base-confirm-action-modal
    ref="confirmActionModalRef"
    title="Withdrawal Insurance"
  >
    <div class="flex flex-col gap-4">
      <base-datepicker layout="v" label="Maturity Date" :model-value="maturityDate" disabled />
      <base-input-number layout="v" label="Payment Amount" align="left" :model-value="amount" disabled decimal-length="2" />
      <hr class="border-slate-300 dark:border-slate-600"  />
      <base-select
        layout="v"
        label="Bank"
        required
        v-model="bankAccountUuid"
        v-model:search="searchBank"
        :errors="errors.bank_account_uuid"
        :options="bankOptions"
        :disabled="isReceiving"
        placeholder="Select"
      />
      <base-datepicker layout="v" label="Received Date" required v-model="receivedDate" :errors="errors.received_date" :disabled="isReceiving" />
      <base-input-number layout="v" label="Received Amount" required align="left" v-model="receivedAmount" :errors="errors.received_amount" :disabled="isReceiving" decimal-length="2" />
      <hr class="border-slate-300 dark:border-slate-600"  />
      <base-input-number layout="v" label="Remaining Amount" align="left" :model-value="remainingAmount" disabled decimal-length="2" allow-negative />
      <base-textarea layout="v" label="Notes" :min-height="128" v-model="notes" :errors="errors.notes" />
    </div>
    <template #action>
      <base-button variant="filled" color="primary" @click="onReceive">Confirm</base-button>
      <base-button variant="filled" color="danger" @click="onDelete">Delete</base-button>
      <base-button variant="filled" color="secondary" @click="confirmActionModalRef.toggleModal(false)">Close</base-button>
    </template>
  </base-confirm-action-modal>
</template>
