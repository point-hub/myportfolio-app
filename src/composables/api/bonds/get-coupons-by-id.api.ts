import type { IReceivedCoupon } from '@/pages/bonds/create/form';
import type { IAuthUser } from '@/stores/auth.store';
import type { IPagination, IQuery } from '@/types';
import { apiRequest } from '@/utils/api';

import type { IBankAccount } from '../master/banks/get-accounts.api';
import type { IOwnerData } from '../master/owners/get.api';

export interface IBondData {
  _id?: string;
  form_number?: string;
  product?: string;
  publisher?: string;
  type?: string;
  series?: string;
  year_issued?: string;
  bank_source_id?: string;
  bank_source_account_uuid?: string;
  bank_source?: IBankAccount;
  bank_placement_id?: string;
  bank_placement_account_uuid?: string;
  bank_placement?: IBankAccount;
  owner_id?: string;
  owner?: IOwnerData;
  base_date?: number;
  transaction_date?: string;
  settlement_date?: string;
  maturity_date?: string;
  transaction_number?: number;
  price?: number;
  principal_amount?: number;
  proceed_amount?: number;
  accrued_interest?: number;
  total_proceed?: number;
  coupon_tenor?: number;
  coupon_rate?: number;
  coupon_gross_amount?: number;
  coupon_tax_rate?: number;
  coupon_tax_amount?: number;
  coupon_net_amount?: number;
  coupon_date?: string;
  received_coupons?: IReceivedCoupon[];
  remaining_amount?: number;
  notes?: string | null;
  is_archived?: boolean | null;
  created_at?: Date;
  created_by_id?: string;
  created_by?: IAuthUser;
  updated_at?: Date | null;
  updated_by_id?: string | null;
  archived_at?: Date | null;
  archived_by_id?: string | null;
  status?: 'active' | 'draft' | 'completed';
  coupon_status?: 'completed' | 'pending';
}

export interface IResponse {
  data: IBondData[]
  pagination: IPagination
}

// Use a shared controller that can be replaced
let controller: AbortController | null = null;

export const getCouponsByIdBondsApi = async (id: string, query?: IQuery): Promise<IResponse> => {
  // Abort the previous request if it exists
  if (controller) {
    controller.abort();
  }

  // Create a new AbortController for this request
  controller = new AbortController();
  const response = await apiRequest.get(`/v1/bonds/${id}`, {
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
