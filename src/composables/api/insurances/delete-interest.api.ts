import { apiRequest } from '@/utils/api';

interface IResponse {
  matched_count: string
  modified_count: string
}

export const deleteInterestInsuranceApi = async (id: string, data:unknown): Promise<IResponse> => {
  const response = await apiRequest.post(`/v1/insurances/${id}/delete-interest`, data);

  return response.data;
};
