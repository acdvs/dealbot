import { useQuery } from '@tanstack/react-query';
import { getSellers } from '@/actions/itad-api';

function useSellers() {
  const { data } = useQuery({
    queryKey: ['sellers'],
    queryFn: getSellers,
    select: (data) => data?.map((x) => x.title),
    staleTime: 1000 * 60 * 60 * 24,
  });

  return data || [];
}

export default useSellers;
