import { watchDebounced } from '@vueuse/core';
import { computed, onMounted, ref } from 'vue';

import { getStocksApi, type IStockData } from '../api/stocks/get.api';

export interface IStockOption {
  label: string
  value: string
  transaction_number: string
  date: string
  amount: number
}

export function useSelectableStocks() {
  const stocks = ref<IStockData[]>([]);
  const searchStock = ref<string | undefined>();
  const isLoading = ref(false);

  const options = computed(() =>
    stocks.value.map((stock) => ({
      label: `${stock.transaction_number}`,
      value: stock._id,
      transaction_number: stock.transaction_number,
      date: stock.transaction_date,
      amount: stock.proceed_amount,
    })),
  );

  // Use a shared controller that can be replaced
  let controller: AbortController | null = null;

  const getStocks = async (search?: string) => {
    // Abort the previous request if it exists
    if (controller) {
      controller.abort();
    }

    // Create a new AbortController for this request
    controller = new AbortController();

    isLoading.value = true;
    const response = await getStocksApi({
      search: {
        all: search,
        status: 'active',
      },
      page: 1,
      page_size: 100,
    });

    stocks.value = response.data;
    isLoading.value = false;
  };

  watchDebounced(
    searchStock,
    async (val) => {
      await getStocks(val);
    },
    { debounce: 500, maxWait: 1000 },
  );

  onMounted(() => {
    getStocks();
  });

  return {
    stocks,
    options,
    isLoading,
    searchStock,
    getStocks,
  };
}
