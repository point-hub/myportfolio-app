import { apiRequest } from '@/utils/api';

export interface IResponse {
  inserted_id: string
}

export const createInsuranceApi = async (data: unknown): Promise<IResponse> => {
  const response = await apiRequest.post('/v1/insurances', data);

  return response.data;
};
