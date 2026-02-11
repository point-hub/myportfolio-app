<script setup lang="ts">
import { watchEffect } from 'vue';

import { type IStockOption,useSelectableStocks } from '@/composables/selectable/stocks';
import { formatNumber } from '@/utils/number';

import { type IForm, type IFormError, type ITransaction } from './form';

const data = defineModel<IForm>('data');
const errors = defineModel<IFormError>('errors');
const isSaving = defineModel('is-saving', { default: false });

const { options: stockOptions, searchStock } = useSelectableStocks();

const onAdd = () => {
  data.value?.transactions?.push({
    stock_id: '',
    stock: undefined,
    transaction_number: '',
    date: '',
    amount: 0,
  });
};

watchEffect(() => {
  if (!data.value) {
    return;
  }

  data.value.total = data.value?.transactions?.reduce((sum, item) => {
    return sum + (item.amount ?? 0);
  }, 0) ?? 0;
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const onDelete = (index: number) => {
  data.value?.transactions?.splice(index, 1);
};

const onSelected = (selected: IStockOption,  transaction: ITransaction) => {
  transaction.transaction_number = selected.transaction_number;
  transaction.date = selected.date;
  transaction.amount = selected.amount;
};

const resolveOption = (value: string, transaction: ITransaction): IStockOption | undefined => {
  if (transaction.stock?._id === value) {
    return {
      label: transaction.stock.transaction_number ?? '',
      value: transaction.stock._id,
      transaction_number: transaction.stock.transaction_number ?? '',
      date: transaction.stock.transaction_date ?? '',
      amount: transaction.stock.proceed_amount ?? 0,
    };
  }
  return undefined;
};
</script>

<template>
  <base-card title="transactions">
    <base-table class="min-h-48">
      <thead>
        <tr>
          <th class="w-1">No</th>
          <th class="whitespace-nowrap">Trasanction Number</th>
          <th class="whitespace-nowrap">Transaction Date</th>
          <th class="text-right w-32">Amount</th>
          <th class="w-1"></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(transaction, index) in data?.transactions">
          <td class="text-center">{{ index + 1 }}</td>
          <td>
            <base-choosen
              title="Transaction Number"
              v-model="transaction.stock_id"
              v-model:search="searchStock"
              @select="(selected: IStockOption) => onSelected(selected, transaction)"
              :resolve-option="(value: string) => resolveOption(value, transaction)"
              :options="stockOptions"
              :errors="errors?.[`transactions.${index}.stock_id`]"
              :disabled="isSaving"
              placeholder="Select"
              border="none"
              paddingless
            />
          </td>
          <td>{{ transaction.date }}</td>
          <td class="text-right">{{ formatNumber(transaction?.amount, 2) }}</td>
          <td>
            <!-- <base-button @click="onDelete(index)" variant="filled" color="danger" :disabled="isSaving">
              <base-icon class="i-fa7-regular:circle-x" />
            </base-button> -->
          </td>
        </tr>
        <tr>
          <td></td>
          <td></td>
          <td class="text-right font-bold">TOTAL</td>
          <td class="text-right">{{ formatNumber(data?.total, 2) }}</td>
        </tr>
      </tbody>
    </base-table>
    <base-button variant="filled" color="primary" :disabled="isSaving" @click="onAdd">
      Add
    </base-button>
  </base-card>
</template>

<style scoped lang="postcss"></style>
