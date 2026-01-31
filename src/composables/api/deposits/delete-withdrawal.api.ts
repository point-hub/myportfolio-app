import { apiRequest } from '@/utils/api';

interface IResponse {
  matched_count: string
  modified_count: string
}

export const deleteWithdrawalDepositApi = async (id: string): Promise<IResponse> => {
  const response = await apiRequest.post(`/v1/deposits/${id}/delete-withdrawal`);

  return response.data;
};
