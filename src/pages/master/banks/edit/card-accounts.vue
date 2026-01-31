<script setup lang="ts">
import { ref } from 'vue';

import AddModal from './add-modal.vue';
import { type IForm } from './form';

const data = defineModel<IForm>('data', {
  default: () => ({
    accounts: [],
  }),
});

const addModalRef = ref();

const onAdd = () => {
  addModalRef.value.toggleModal(data.value.accounts);
};

const onAdded = (account: { account_name: string, account_number: string }) => {
  data.value.accounts?.push({
    account_name: account.account_name,
    account_number: account.account_number,
  });
};

const onDelete = (index: number) => {
  data.value.accounts?.splice(index, 1);
};
</script>

<template>
  <add-modal ref="addModalRef" @added="onAdded"></add-modal>
  <base-card title="accounts">
    <base-table class="min-h-32">
      <thead>
        <tr>
          <th>Account Name</th>
          <th>Account Number</th>
          <th class="w-1"></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(account, index) in data.accounts">
          <td>{{ account.account_name }}</td>
          <td>{{ account.account_number }}</td>
          <td>
            <base-button @click="onDelete(index)" variant="filled" color="danger">
              <base-icon class="i-fa7-regular:circle-x" />
            </base-button>
          </td>
        </tr>
      </tbody>
    </base-table>
    <base-button @click="onAdd" variant="filled" color="primary">
      <base-icon class="i-fa7-regular:circle-plus" /> Add
    </base-button>
  </base-card>
</template>

<style scoped lang="postcss"></style>
