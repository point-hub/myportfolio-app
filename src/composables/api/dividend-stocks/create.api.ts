import { apiRequest } from '@/utils/api';

export interface IResponse {
  inserted_id: string
}

export const createDividendStockApi = async (data: unknown): Promise<IResponse> => {
  const response = await apiRequest.post('/v1/dividend-stocks', data);

  return response.data;
};
