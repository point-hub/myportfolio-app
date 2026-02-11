import { apiRequest } from '@/utils/api';

export interface IResponse {
  inserted_id: string
}

export const extendSavingApi = async (id: string, data: unknown): Promise<IResponse> => {
  const response = await apiRequest.post(`/v1/savings/${id}/extend`, data);

  return response.data;
};
