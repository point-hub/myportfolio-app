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
const saving = defineModel<IForm>('data');

/**
 * Opens the archive confirmation modal for a specific saving.
 */
const onArchiveModal = () => {
  archiveModalRef.value.toggleModal({
    _id: saving.value?._id,
    label: `${saving.value?.form_number}`,
  });
};

/**
 * Handler called after a successful archive.
 */
const onArchived = async () => {
  emit('archived');
};

/**
 * Opens the restore confirmation modal for a specific saving.
 */
const onRestoreModal = () => {
  restoreModalRef.value.toggleModal({
    _id: saving.value?._id,
    label: `${saving.value?.form_number}`,
  });
};

/**
 * Handler called after a successful restore.
 */
const onRestored = async () => {
  emit('restored');
};

/**
 * Opens the delete confirmation modal for a specific saving.
 */
const onDeleteModal = () => {
  deleteModalRef.value.toggleModal({
    _id: saving.value?._id,
    label: `${saving.value?.form_number}`,
  });
};

/**
 * Handler called after a successful deletion.
 */
const onDeleted = async () => {
  await router.push('/savings');
};

const withdrawalModalRef = ref();
const onReceived = () => {
  emit('received');
};

const getWithdrawalAmount = (saving: IForm) => {
  if (saving.interest?.is_rollover) {
    return Number(saving.placement?.amount ?? 0) + Number(saving.interest?.net_amount ?? 0);
  } else {
    return saving.placement?.amount;
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
      <router-link v-if="authStore.hasPermission('savings:create')" :to="`/savings/create`">
        <base-button variant="filled" color="primary" size="sm" class="font-bold">
          <base-icon icon="i-fa7-solid:file-plus" /> CREATE
        </base-button>
      </router-link>
      <router-link v-if="authStore.hasPermission('savings:update') && saving?._id" :to="`/savings/${route.params.id}/edit`">
        <base-button variant="filled" color="primary" size="sm" class="font-bold">
          <base-icon icon="i-fa7-solid:file-pen" /> EDIT
        </base-button>
      </router-link>
      <router-link v-if="authStore.hasPermission('savings:renew') && saving?._id && saving.status === 'active'" :to="`/savings/${route.params.id}/extend`">
        <base-button variant="filled" color="primary" size="sm" class="font-bold">
          <base-icon icon="i-fa7-solid:file-pen" /> EXTEND
        </base-button>
      </router-link>
      <base-button
        v-if="authStore.hasPermission('savings:withdraw') && (saving?.status === 'active' || saving?.status === 'withdrawn')"
        variant="filled"
        color="primary"
        size="sm"
        class="font-bold"
        @click="() => {
          withdrawalModalRef.toggleModal({
            _id: saving?._id,
            payment_date: saving?.placement?.maturity_date,
            amount: getWithdrawalAmount(saving!),
            bank_id: saving?.source?.bank?._id,
            bank_account_uuid: saving?.source?.bank?.account?.uuid,
            received_date: saving?.withdrawal?.received_date,
            received_amount: saving?.withdrawal?.received_amount,
          })
        }"
      >
        <base-icon icon="i-fa7-solid:money-from-bracket" /> WITHDRAW
      </base-button>
      <!-- <router-link v-if="authStore.hasPermission('savings:read')" :to="`/savings/${route.params.id}/histories`">
        <base-button variant="filled" color="primary" size="sm" class="font-bold">
          <base-icon icon="i-fa7-solid:rectangle-history-circle-user" /> HISTORIES
        </base-button>
      </router-link>
      <router-link v-if="authStore.hasPermission('audit-logs:read')" :to="`/savings/${route.params.id}/audits`">
        <base-button variant="filled" color="primary" size="sm" class="font-bold">
          <base-icon icon="i-fa7-solid:file-magnifying-glass" /> AUDITS
        </base-button>
      </router-link> -->
      <base-button v-if="authStore.hasPermission('savings:delete') && saving?._id" @click="onDeleteModal" variant="filled" color="primary" size="sm" class="font-bold">
        <base-icon icon="i-fa7-solid:trash-xmark" /> DELETE
      </base-button>
      <base-button v-if="authStore.hasPermission('savings:update') && saving?._id && !saving.is_archived" @click="onArchiveModal" variant="filled" color="primary" size="sm" class="font-bold">
        <base-icon icon="i-fa7-solid:box-archive" /> ARCHIVE
      </base-button>
      <base-button v-if="authStore.hasPermission('savings:update') && saving?._id && saving.is_archived" @click="onRestoreModal" variant="filled" color="primary" size="sm" class="font-bold">
        <base-icon icon="i-fa7-solid:box-arrow-up" /> RESTORE
      </base-button>
    </div>
  </base-card>
</template>

<style scoped lang="postcss"></style>
