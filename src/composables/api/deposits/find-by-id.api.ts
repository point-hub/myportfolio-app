import type { IAuthUser } from '@/stores/auth.store';
import { apiRequest } from '@/utils/api';

import type { IOwnerData } from '../master/owners/get.api';
import type { IBankData } from './get.api';

export interface IResponse {
  _id: string
  form_number?: string
  owner_id?: string
  owner?: IOwnerData
  group_id?: string
  group?: IOwnerData
  placement?: {
    bilyet_number?: string
    base_date?: number
    date?: string
    term?: number
    maturity_date?: string
    bank_id?: string
    bank?: IBankData
    amount?: number
  }
  source?: {
    bank_id?: string
    bank_account_uuid?: string
    bank?: IBankData
  }
  interest?: {
    payment_method?: string
    rate?: number
    gross_amount?: number
    tax_rate?: number
    tax_amount?: number
    net_amount?: number
    bank_id?: string
    bank_account_uuid?: string
    bank?: IBankData
    is_rollover?: boolean
  }
  interest_schedule?: {
    term?: number
    payment_date?: string
    amount?: number
    received_date?: string
    received_amount?: number
    bank_id?: string
    bank_account_uuid?: string
    bank?: IBankData
    created_by?: IAuthUser
  }[]
  cashback?: {
    bank_id?: string
    bank_account_uuid?: string
    bank?: IBankData
    created_by?: IAuthUser
  }
  cashback_schedule?: {
    payment_date?: string
    rate?: number
    amount?: number
    received_date?: string
    received_amount?: number
    bank_id?: string
    bank_account_uuid?: string
    bank?: IBankData
    created_by?: IAuthUser
  }[]
  notes?: string | null | undefined
  is_archived?: boolean
  status?: 'draft' | 'active' | 'withdrawn' | 'renewed'
  created_at?: Date
  created_by_id?: string
  created_by?: IAuthUser
}

// Use a shared controller that can be replaced
let controller: AbortController | null = null;

export const findDepositApi = async (_id: string): Promise<IResponse> => {
  // Abort the previous request if it exists
  if (controller) {
    controller.abort();
  }

  // Create a new AbortController for this request
  controller = new AbortController();
  const response = await apiRequest.get(`/v1/deposits/${_id}`, {
    signal: controller.signal,
  });

  return response.data;
};
