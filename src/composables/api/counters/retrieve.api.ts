import { apiRequest } from '@/utils/api';

interface IResponse {
  name: string
  template: string
  seq: number
  seq_pad: number
  value: string
  created_at: string
}

export const retrieveCounterApi = async (name: string, date?: Date): Promise<IResponse> => {
  const response = await apiRequest.get('/v1/counters/by-name', {
    params: {
      name,
      date,
    },
  });

  return response.data;
};
