import { watchDebounced } from '@vueuse/core';
import { computed, onMounted, ref } from 'vue';

import { getOwnersApi, type IOwnerData } from '../api/master/owners/get.api';

export function useSelectableOwners() {
  const owners = ref<IOwnerData[]>([]);
  const searchOwner = ref<string | undefined>();
  const isLoading = ref(false);

  const options = computed(() =>
    owners.value.map((owner) => ({
      label: owner.name,
      value: owner._id,
    })),
  );

  // controller is scoped to THIS composable instance
  let controller: AbortController | null = null;

  const getOwners = async (search?: string) => {
    // Abort the previous request if it exists
    if (controller) {
      controller.abort();
    }

    // Create a new AbortController for this request
    controller = new AbortController();

    isLoading.value = true;
    const response = await getOwnersApi({
      search: {
        all: search,
      },
      page: 1,
      page_size: 100,
    });

    owners.value = response.data;
    isLoading.value = false;
  };

  watchDebounced(
    searchOwner,
    async (val) => {
      await getOwners(val);
    },
    { debounce: 500, maxWait: 1000 },
  );

  onMounted(() => {
    getOwners();
  });

  return {
    owners,
    options,
    isLoading,
    searchOwner,
    getOwners,
  };
}
