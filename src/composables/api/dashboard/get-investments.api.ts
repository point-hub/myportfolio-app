import type { IQuery } from '@/types';
import { apiRequest } from '@/utils/api';

export type InvestmentType = 'savings' | 'deposits' | 'insurances' | 'stocks' | 'bonds'

export interface IInvestmentSummaryItem {
  type: InvestmentType
  label: string
  acquisition_value: number
  weight: number
  gross_interest: number
  tax: number
  total_interest: number
  cashback: number
  return_in: number
}

export interface IInvestmentSummaryResponse {
  allocation: IInvestmentSummaryItem[]
  data: IInvestmentSummaryItem[]
  total: {
    acquisition_value: number
    weight: number
    gross_interest: number
    tax: number
    total_interest: number
    cashback: number
    return_in: number
  }
}

export const getDashboardInvestmentsApi = async (
  query?: IQuery,
  controller: AbortController | null = null,
): Promise<IInvestmentSummaryResponse> => {
  const response = await apiRequest.get('/v1/dashboard/investments', {
    params: {
      search: query?.search,
    },
    signal: controller?.signal,
  });

  return response.data;
};
