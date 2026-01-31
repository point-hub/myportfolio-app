import { watchDebounced } from '@vueuse/core';
import { computed, onMounted, ref } from 'vue';

import { getBankAccountsApi, type IBankAccountData } from '../api/master/banks/get-accounts.api';

export function useSelectableBankAccounts() {
  const banks = ref<IBankAccountData[]>([]);
  const searchBank = ref<string | undefined>();
  const isLoading = ref(false);

  const options = computed(() =>
    banks.value.map((bank) => ({
      label: `[${bank.name}] ${bank.account_number} a/n ${bank.account_name}`,
      bank_id: bank._id,
      name: bank.name,
      account_name: bank.account_name,
      account_number: bank.account_number,
      value: bank.account_uuid,
    })),
  );

  const getBanks = async (search?: string) => {
    isLoading.value = true;
    const response = await getBankAccountsApi({
      search: {
        all: search,
      },
      page: 1,
      page_size: 100,
    });

    banks.value = response.data;
    isLoading.value = false;
  };

  watchDebounced(
    searchBank,
    async (val) => {
      await getBanks(val);
    },
    { debounce: 500, maxWait: 1000 },
  );

  onMounted(() => {
    getBanks();
  });

  const getLabel = (data: {
    bank_name?: string
    bank_account_number?: string
    bank_account_name?: string
  }) => {
    if (!data || !data.bank_name || !data.bank_account_number || !data.bank_account_name) {
      return '';
    }

    return `[${data.bank_name}] ${data.bank_account_number} a/n ${data.bank_account_name}`;
  };

  return {
    banks,
    options,
    isLoading,
    searchBank,
    getBanks,
    getLabel,
  };
}
