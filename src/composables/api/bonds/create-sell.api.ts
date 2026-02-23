import { apiRequest } from '@/utils/api';

export interface IResponse {
  matched_count: string
  modified_count: string
}

export const createSellBondApi = async (_id: string, data: unknown): Promise<IResponse> => {
  const response = await apiRequest.post(`/v1/bonds/${_id}/create-sell`, data);

  return response.data;
};
