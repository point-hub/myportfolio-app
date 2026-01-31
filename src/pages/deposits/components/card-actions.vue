<script setup lang="ts">
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { useAuthStore } from '@/stores/auth.store';

import type { IForm } from '../details/form';
import ArchiveModal from './archive-modal/index.vue';
import DeleteModal from './delete-modal/index.vue';
import RestoreModal from './restore-modal/index.vue';
import WithdrawalModal from './withdrawal-modal/index.vue';

const emit = defineEmits(['archived', 'restored', 'received']);

const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();
const archiveModalRef = ref();
const restoreModalRef = ref();
const deleteModalRef = ref();
const deposit = defineModel<IForm>('data');

/**
 * Opens the archive confirmation modal for a specific deposit.
 */
const onArchiveModal = () => {
  archiveModalRef.value.toggleModal({
    _id: deposit.value?._id,
    label: `${deposit.value?.form_number}`,
  });
};

/**
 * Handler called after a successful archive.
 */
const onArchived = async () => {
  emit('archived');
};

/**
 * Opens the restore confirmation modal for a specific deposit.
 */
const onRestoreModal = () => {
  restoreModalRef.value.toggleModal({
    _id: deposit.value?._id,
    label: `${deposit.value?.form_number}`,
  });
};

/**
 * Handler called after a successful restore.
 */
const onRestored = async () => {
  emit('restored');
};

/**
 * Opens the delete confirmation modal for a specific deposit.
 */
const onDeleteModal = () => {
  deleteModalRef.value.toggleModal({
    _id: deposit.value?._id,
    label: `${deposit.value?.form_number}`,
  });
};

/**
 * Handler called after a successful deletion.
 */
const onDeleted = async () => {
  await router.push('/deposits');
};

const withdrawalModalRef = ref();
const onReceived = () => {
  emit('received');
};

const getWithdrawalAmount = (deposit: IForm) => {
  if (deposit.interest?.is_rollover) {
    return Number(deposit.placement?.amount ?? 0) + Number(deposit.interest?.net_amount ?? 0);
  } else {
    return deposit.placement?.amount;
  }
};
</script>

<template>
  <archive-modal ref="archiveModalRef" @archived="onArchived" />
  <restore-modal ref="restoreModalRef" @restored="onRestored" />
  <delete-modal ref="deleteModalRef" @deleted="onDeleted" />
  <withdrawal-modal ref="withdrawalModalRef" @received="onReceived" />

  <base-card class="py-3! gap-0!">
    <div class="flex gap-2 overflow-auto scrollbar-hidden">
      <router-link v-if="authStore.hasPermission('deposits:create')" :to="`/deposits/create`">
        <base-button variant="filled" color="primary" size="sm" class="font-bold">
          <base-icon icon="i-fa7-solid:file-plus" /> CREATE
        </base-button>
      </router-link>
      <router-link v-if="authStore.hasPermission('deposits:update') && deposit?._id" :to="`/deposits/${route.params.id}/edit`">
        <base-button variant="filled" color="primary" size="sm" class="font-bold">
          <base-icon icon="i-fa7-solid:file-pen" /> EDIT
        </base-button>
      </router-link>
      <router-link v-if="authStore.hasPermission('deposits:update') && deposit?._id && deposit.status === 'active'" :to="`/deposits/${route.params.id}/extend`">
        <base-button variant="filled" color="primary" size="sm" class="font-bold">
          <base-icon icon="i-fa7-solid:file-pen" /> EXTEND
        </base-button>
      </router-link>
      <base-button
        v-if="authStore.hasPermission('deposits:update') && deposit?.status !== 'draft'"
        variant="filled"
        color="primary"
        size="sm"
        class="font-bold"
        @click="() => {
          withdrawalModalRef.toggleModal({
            _id: deposit?._id,
            payment_date: deposit?.placement?.maturity_date,
            amount: getWithdrawalAmount(deposit!),
            bank_id: deposit?.source?.bank?._id,
            bank_account_uuid: deposit?.source?.bank?.account?.uuid,
            received_date: deposit?.withdrawal?.received_date,
            received_amount: deposit?.withdrawal?.received_amount,
          })
        }"
      >
        <base-icon icon="i-fa7-solid:money-from-bracket" /> WITHDRAW
      </base-button>
      <!-- <router-link v-if="authStore.hasPermission('deposits:read')" :to="`/deposits/${route.params.id}/histories`">
        <base-button variant="filled" color="primary" size="sm" class="font-bold">
          <base-icon icon="i-fa7-solid:rectangle-history-circle-user" /> HISTORIES
        </base-button>
      </router-link>
      <router-link v-if="authStore.hasPermission('audit-logs:read')" :to="`/deposits/${route.params.id}/audits`">
        <base-button variant="filled" color="primary" size="sm" class="font-bold">
          <base-icon icon="i-fa7-solid:file-magnifying-glass" /> AUDITS
        </base-button>
      </router-link> -->
      <base-button v-if="authStore.hasPermission('deposits:delete') && deposit?._id" @click="onDeleteModal" variant="filled" color="primary" size="sm" class="font-bold">
        <base-icon icon="i-fa7-solid:trash-xmark" /> DELETE
      </base-button>
      <base-button v-if="authStore.hasPermission('deposits:update') && deposit?._id && !deposit.is_archived" @click="onArchiveModal" variant="filled" color="primary" size="sm" class="font-bold">
        <base-icon icon="i-fa7-solid:box-archive" /> ARCHIVE
      </base-button>
      <base-button v-if="authStore.hasPermission('deposits:update') && deposit?._id && deposit.is_archived" @click="onRestoreModal" variant="filled" color="primary" size="sm" class="font-bold">
        <base-icon icon="i-fa7-solid:box-arrow-up" /> RESTORE
      </base-button>
    </div>
  </base-card>
</template>

<style scoped lang="postcss"></style>
