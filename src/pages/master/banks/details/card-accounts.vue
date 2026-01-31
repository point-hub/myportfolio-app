<script setup lang="ts">
import { type IForm } from './form';

const data = defineModel<IForm>('data', {
  default: () => ({
    accounts: [],
  }),
});
</script>

<template>
  <base-card title="accounts">
    <base-table class="min-h-32">
      <thead>
        <tr>
          <th>Account Name</th>
          <th>Account Number</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(account, index) in data.accounts">
          <td>{{ account.account_name }}</td>
          <td>{{ account.account_number }}</td>
        </tr>
      </tbody>
    </base-table>
  </base-card>
</template>

<style scoped lang="postcss"></style>
