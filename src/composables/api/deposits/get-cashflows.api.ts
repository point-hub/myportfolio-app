import type { IPagination, IQuery } from '@/types';
import { apiRequest } from '@/utils/api';

import type { IBankData } from './get.api';

export interface ICashflowData {
  _id: string
  deposit_id: string
  transaction_type: 'placement' | 'withdrawal' | 'realised-interest'
  transaction_date?: string
  form_number?: string
  investment_type: 'Deposito'
  bank_account?: IBankData
  placement_bank?: IBankData
  description: string
  income: number
  principal_debit: number
  principal_credit: number
  principal_balance: number
  notes?: string
  income_debit: number
  income_credit: number
  income_account?: IBankData
  balance: number
}

export interface IResponse {
  data: ICashflowData[]
  pagination: IPagination
}

let controller: AbortController | null = null;

export const getDepositCashflowsApi = async (query?: IQuery): Promise<IResponse> => {
  if (controller) {
    controller.abort();
  }

  controller = new AbortController();
  const response = await apiRequest.get('/v1/cashflows', {
    params: {
      search: query?.search,
      page: query?.page || 1,
      page_size: query?.page_size || 10,
      sort: query?.sort || 'transaction_date,form_number',
    },
    signal: controller.signal,
  });

  return response.data;
};
