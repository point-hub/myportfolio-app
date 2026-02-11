import type { IPagination, IQuery } from '@/types';
import { apiRequest } from '@/utils/api';

export interface IBankAccountData {
  _id: string
  code: string
  name: string
  branch: string
  address: string
  phone: string
  account_uuid: string
  account_number: string
  account_name: string
  account: {
    account_number: string
    account_name: string
  }
  notes: string
  is_archived: string
  created_at: Date
  created_by_id: string
}

export interface IBankAccount {
  _id: string
  code: string
  name: string
  branch: string
  address: string
  phone: string
  account: {
    account_number: string
    account_name: string
  }
  notes: string
  is_archived: string
  created_at: Date
  created_by_id: string
}

export interface IResponse {
  data: IBankAccountData[]
  pagination: IPagination
}

export const getBankAccountsApi = async (query?: IQuery, controller: AbortController | null = null): Promise<IResponse> => {
  const response = await apiRequest.get('/v1/master/banks/accounts', {
    params: {
      search: query?.search,
      page: query?.page || 1,
      page_size: query?.page_size || 10,
      sort: query?.sort || '-_id',
    },
    signal: controller?.signal,
  });

  return response.data;
};
