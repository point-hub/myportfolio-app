import type { IPagination, IQuery } from '@/types';
import { apiRequest } from '@/utils/api';

import type { IBrokerData } from '../master/brokers/get.api';
import type { IIssuerData } from '../master/issuers/get.api';

export interface IStockHoldingData {
  issuer_id?: string;
  issuer?: Pick<IIssuerData, '_id' | 'code' | 'name'>;
  broker_id?: string;
  broker?: Pick<IBrokerData, '_id' | 'code' | 'name'>;
  number_of_shares: number;
  total_buying_price: number;
  average_buying_price: number;
}

export interface IResponse {
  data: IStockHoldingData[]
  pagination: IPagination
}

export const getStockHoldingsApi = async (query?: IQuery): Promise<IResponse> => {
  const response = await apiRequest.get('/v1/stocks/holdings', {
    params: {
      search: query?.search,
      page: query?.page || 1,
      page_size: query?.page_size || 10,
    },
  });

  return response.data;
};

export const exportStockHoldingsApi = async (query?: IQuery): Promise<Blob> => {
  const response = await apiRequest.get('/v1/stocks/holdings', {
    params: {
      search: query?.search,
      page: 1,
      page_size: 100000,
      export: 'csv',
    },
    responseType: 'blob',
  });

  return response.data;
};
