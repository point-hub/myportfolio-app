import { apiRequest } from '@/utils/api';

export interface IResponse {
  inserted_id: string
}

export const draftDividendStockApi = async (data: unknown): Promise<IResponse> => {
  const response = await apiRequest.post('/v1/dividend-stocks/draft', data);

  return response.data;
};
