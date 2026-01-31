import { apiRequest } from '@/utils/api';

export interface IResponse {
  inserted_id: string
}

export const extendDepositApi = async (id: string, data: unknown): Promise<IResponse> => {
  const response = await apiRequest.post(`/v1/deposits/${id}/extend`, data);

  return response.data;
};
