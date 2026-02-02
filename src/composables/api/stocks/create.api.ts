import { apiRequest } from '@/utils/api';

export interface IResponse {
  inserted_id: string
}

export const createStockApi = async (data: unknown): Promise<IResponse> => {
  const response = await apiRequest.post('/v1/stocks', data);

  return response.data;
};
