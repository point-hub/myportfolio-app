import { apiRequest } from '@/utils/api';

export interface IResponse {
  inserted_id: string
}

export const draftInsuranceApi = async (data: unknown): Promise<IResponse> => {
  const response = await apiRequest.post('/v1/insurances/draft', data);

  return response.data;
};
