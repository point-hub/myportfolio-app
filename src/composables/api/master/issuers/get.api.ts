import type { IPagination, IQuery } from '@/types';
import { apiRequest } from '@/utils/api';

export interface IIssuerData {
  _id: string
  code: string
  name: string
  notes: string
  is_archived: string
  created_at: Date
  created_by_id: string
}

export interface IResponse {
  data: IIssuerData[]
  pagination: IPagination
}

export const getIssuersApi = async (query?: IQuery, controller: AbortController | null = null): Promise<IResponse> => {
  const response = await apiRequest.get('/v1/master/issuers', {
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
