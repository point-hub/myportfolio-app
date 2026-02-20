import type { IAuthUser } from '@/stores/auth.store';
import type { IPagination, IQuery } from '@/types';
import { apiRequest } from '@/utils/api';

import type { IOwnerData } from '../master/owners/get.api';

export interface IBankData {
  _id: string
  code: string
  name: string
  branch: string
  address: string
  phone: string
  account: {
    uuid: string
    account_number: string
    account_name: string
  }
  notes: string
  is_archived: string
  created_at: Date
  created_by_id: string
}

export interface IDepositData {
  _id: string
  form_number?: string
  owner?: IOwnerData
  group?: IOwnerData
  placement?: {
    bilyet_number?: string
    base_date?: number
    date?: string
    term?: number
    maturity_date?: string
    bank?: IBankData
    amount?: number
  }
  source?: {
    bank?: IBankData
  }
  interest?: {
    payment_method?: string
    rate?: number
    gross_amount?: number
    tax_rate?: number
    tax_amount?: number
    net_amount?: number
    bank?: IBankData
    is_rollover?: boolean
  }
  interest_schedule?: {
    term?: number
    payment_date?: string
    received_date?: string
    amount?: number
    received_amount?: number
    bank?: IBankData
    created_by?: IAuthUser
    created_at?: string
  }[]
  cashback?: {
    bank?: IBankData
  }
  cashback_schedule?: {
    payment_date?: string
    received_date?: string
    rate?: number
    amount?: number
    received_amount?: number
    bank?: IBankData
    created_by?: IAuthUser
    created_at?: string
  }[]
  withdrawal?: {
    received_date?: string
    received_amount?: number
    remaining_amount?: number
    bank?: IBankData
    notes?: string
    created_by?: IAuthUser
    created_at?: string
  }
  notes?: string | null | undefined
  is_archived: boolean
  status?: 'draft' | 'active' | 'withdrawn' | 'renewed'
  created_at: Date
  created_by_id: string
}

export interface IResponse {
  data: IDepositData[]
  pagination: IPagination
}

// Use a shared controller that can be replaced
let controller: AbortController | null = null;

export const getDepositsApi = async (query?: IQuery): Promise<IResponse> => {
  // Abort the previous request if it exists
  if (controller) {
    controller.abort();
  }

  // Create a new AbortController for this request
  controller = new AbortController();
  const response = await apiRequest.get('/v1/deposits', {
    params: {
      search: query?.search,
      page: query?.page || 1,
      page_size: query?.page_size || 10,
      sort: query?.sort || '-_id',
    },
    signal: controller.signal,
  });

  return response.data;
};
