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

export function useStates(countryIso2: string) {
  return useQuery({
    queryKey: ['geographic', 'states', countryIso2],
    queryFn: () => geographicService.getStates(countryIso2),
    enabled: !!countryIso2,
    staleTime: 1000 * 60 * 60 * 24,
    retry: 1,
  });
}

export function useCities(countryIso2: string, stateIso2: string) {
  return useQuery({
    queryKey: ['geographic', 'cities', countryIso2, stateIso2],
    queryFn: () => geographicService.getCities(countryIso2, stateIso2),
    enabled: !!countryIso2 && !!stateIso2,
    staleTime: 1000 * 60 * 60 * 24,
    retry: 1,
  });
}
