import type { IQuery } from '@/types';
import { apiRequest } from '@/utils/api';

export interface IResponse {
  url: string
  expires_at: string
}

export const exportDepositCashflowsApi = async (query?: IQuery): Promise<IResponse> => {
  const response = await apiRequest.get('/v1/cashflows/export', {
    params: {
      search: query?.search,
      sort: query?.sort || 'transaction_date,form_number',
    },
  });

  return response.data;
};
