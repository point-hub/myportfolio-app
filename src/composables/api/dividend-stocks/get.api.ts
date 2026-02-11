import type { IPagination, IQuery } from '@/types';
import { apiRequest } from '@/utils/api';

import type { IBankData } from '../deposits/get.api';
import type { IBrokerData } from '../master/brokers/get.api';
import type { IIssuerData } from '../master/issuers/get.api';
import type { IOwnerData } from '../master/owners/get.api';
import type { IUserData } from '../master/users/get.api';

export interface IDividendStockData {
  _id?: string;
  form_number?: string;
  dividend_date?: string;
  broker_id?: string;
  broker?: IBrokerData;
  bank_id?: string;
  bank?: IBankData;
  transactions?: {
    stock_id?: string;
    owner_id?: string;
    stock?: IIssuerData;
    owner?: IOwnerData;
    dividend_date?: string;
    shares?: number;
    dividend_amount?: number;
    total_dividend?: number;
    received_amount?: number;
  }[];
  total_received?: number;
  notes?: string | null;
  is_archived?: boolean | null;
  status?: 'draft' | 'active'
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
  data: IDividendStockData[]
  pagination: IPagination
}

// Use a shared controller that can be replaced
let controller: AbortController | null = null;

export const getDividendStocksApi = async (query?: IQuery): Promise<IResponse> => {
  // Abort the previous request if it exists
  if (controller) {
    controller.abort();
  }

  // Create a new AbortController for this request
  controller = new AbortController();
  const response = await apiRequest.get('/v1/dividend-stocks', {
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
