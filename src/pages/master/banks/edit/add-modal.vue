<script setup lang="ts">
import { ref } from 'vue';

import BaseConfirmActionModal from '@/components/base-confirm-action-modal.vue';
import { toast } from '@/toast';
import { handleError } from '@/utils/api';


interface IAccount {
  account_name: string
  account_number: string
}

const confirmActionModalRef = ref();
const existingAccounts = ref<IAccount[]>([]);
const emit = defineEmits(['added']);

const toggleModal = (accounts: IAccount[]) => {
  existingAccounts.value = accounts;
  confirmActionModalRef.value.toggleModal();
};

const isAdding = ref(false);
const onAdd = async () => {
  // prevent calling twice use loading state
  if (isAdding.value) return;
  isAdding.value = true;

  try {
    if (!accountName.value) {
      accountNameError.value = ['required'];
      return;
    }

    if (!accountNumber.value) {
      accountNumberError.value = ['required'];
      return;
    }

    const accountNumberExists = existingAccounts.value.some(
      a => a.account_number === accountNumber.value,
    );

    if (accountNumberExists) {
      accountNumberError.value = ['is exists'];
      return;
    }

    const accountNameExists = existingAccounts.value.some(
      a => a.account_name === accountName.value,
    );

    if (accountNameExists) {
      accountNameError.value = ['is exists'];
      return;
    }

    emit('added', {
      account_name: accountName.value,
      account_number: accountNumber.value,
    });

    reset();
    confirmActionModalRef.value.toggleModal();
  } catch (error) {
    const errorResponse = handleError(error);
    if (errorResponse.message) {
      toast(errorResponse.message, {
        lists: errorResponse.lists,
        color: 'danger',
      });
    }
  } finally {
    // stop loading state
    isAdding.value = false;
  }
};

const accountNumber = ref();
const accountName = ref();
const accountNumberError = ref();
const accountNameError = ref();

const reset = () => {
  accountNumber.value = undefined;
  accountName.value = undefined;
  accountNumberError.value = undefined;
  accountNameError.value = undefined;
};

defineExpose({
  toggleModal,
  isAdding,
});
</script>

<template>
  <base-confirm-action-modal
    ref="confirmActionModalRef"
    title="Add Account"
    @success="onAdd"
  >
    <div class="flex flex-col gap-4">
      <base-input layout="v" label="Account Name" autofocus required v-model="accountName" :errors="accountNameError" />
      <base-input layout="v" label="Account Number" required v-model="accountNumber" :errors="accountNumberError" />
    </div>
  </base-confirm-action-modal>
</template>
