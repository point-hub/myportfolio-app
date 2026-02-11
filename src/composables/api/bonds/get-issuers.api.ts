import type { IPagination, IQuery } from '@/types';
import { apiRequest } from '@/utils/api';

import type { IBrokerData } from '../master/brokers/get.api';
import type { IIssuerData } from '../master/issuers/get.api';
import type { IOwnerData } from '../master/owners/get.api';
import type { IUserData } from '../master/users/get.api';

export interface IBondData {
  _id?: string;
    form_number?: string;
    transaction_date?: string;
    settlement_date?: Date;
    broker_id?: string;
    broker?: IBrokerData;
    owner_id?: string;
    owner?: IOwnerData;
    transaction_number?: string;
    buying_list?: {
      issuer_id?: string;
      issuer?: IIssuerData;
      lots?: number;
      shares?: number;
      price?: number;
      total?: number;
    };
    selling_list?: {
      issuer_id?: string;
      issuer?: IIssuerData;
      lots?: number;
      shares?: number;
      price?: number;
      total?: number;
    }[];
    buying_total?: number;
    buying_brokerage_fee?: number;
    buying_vat?: number;
    buying_levy?: number;
    buying_kpei?: number;
    buying_stamp?: number;
    buying_proceed?: number;
    selling_total?: number;
    selling_brokerage_fee?: number;
    selling_vat?: number;
    selling_levy?: number;
    selling_kpei?: number;
    selling_stamp?: number;
    selling_proceed?: number;
    proceed_amount?: number;
    notes?: string | null;
    is_archived?: boolean | null;
    status?: 'draft' | 'active' | 'paid'
    created_at?: Date;
    created_by_id?: string;
    created_by?: IUserData;
    updated_at?: Date | null;
    updated_by_id?: string | null;
    updated_by?: IUserData | null;
    archived_at?: Date | null;
    archived_by_id?: string | null;
    archived_by?: IUserData | null;
}

export interface IResponse {
  data: IBondData[]
  pagination: IPagination
}

// Use a shared controller that can be replaced
let controller: AbortController | null = null;

export const getIssuersBondsApi = async (query?: IQuery): Promise<IResponse> => {
  // Abort the previous request if it exists
  if (controller) {
    controller.abort();
  }

  // Create a new AbortController for this request
  controller = new AbortController();
  const response = await apiRequest.get('/v1/bonds/issuers', {
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
