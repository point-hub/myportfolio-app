import { apiRequest } from '@/utils/api';

export interface IResponse {
  inserted_id: string
}

export const extendInsuranceApi = async (id: string, data: unknown): Promise<IResponse> => {
  const response = await apiRequest.post(`/v1/insurances/${id}/extend`, data);

  return response.data;
};
