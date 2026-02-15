import { useQuery } from '@tanstack/react-query';
import { geographicService } from '@/services/geographicService';

export function useCountries() {
  return useQuery({
    queryKey: ['geographic', 'countries'],
    queryFn: () => geographicService.getCountries(),
    staleTime: 1000 * 60 * 60 * 24, // 24h
    retry: 1,
  });
}

export function useStates(country: string) {
  return useQuery({
    queryKey: ['geographic', 'states', country],
    queryFn: () => geographicService.getStates(country),
    enabled: !!country,
    staleTime: 1000 * 60 * 60 * 24,
    retry: 1,
  });
}

export function useCities(country: string, state: string) {
  return useQuery({
    queryKey: ['geographic', 'cities', country, state],
    queryFn: () => geographicService.getCities(country, state),
    enabled: !!country && !!state,
    staleTime: 1000 * 60 * 60 * 24,
    retry: 1,
  });
}
