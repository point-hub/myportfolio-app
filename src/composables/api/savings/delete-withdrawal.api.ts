import { apiRequest } from '@/utils/api';

interface IResponse {
  matched_count: string
  modified_count: string
}

export const deleteWithdrawalSavingApi = async (id: string): Promise<IResponse> => {
  const response = await apiRequest.post(`/v1/savings/${id}/delete-withdrawal`);

  return response.data;
};
