import axios from 'axios';

const BASE_URL = 'https://countriesnow.space/api/v0.1';

interface CountriesNowResponse<T> {
  error: boolean;
  msg: string;
  data: T;
}

interface CountryData {
  country: string;
  iso2: string;
  iso3: string;
}

interface StateData {
  name: string;
  state_code: string;
}

interface StatesResponse {
  name: string;
  iso2: string;
  iso3: string;
  states: StateData[];
}

export const geographicService = {
  async getCountries(): Promise<string[]> {
    const response = await axios.get<CountriesNowResponse<CountryData[]>>(
      `${BASE_URL}/countries/iso`
    );
    if (response.data.error) throw new Error(response.data.msg);
    return response.data.data.map((c) => c.country).sort();
  },

  async getStates(country: string): Promise<string[]> {
    const response = await axios.post<CountriesNowResponse<StatesResponse>>(
      `${BASE_URL}/countries/states`,
      { country }
    );
    if (response.data.error) throw new Error(response.data.msg);
    return response.data.data.states.map((s) => s.name).sort();
  },

  async getCities(country: string, state: string): Promise<string[]> {
    const response = await axios.post<CountriesNowResponse<string[]>>(
      `${BASE_URL}/countries/state/cities`,
      { country, state }
    );
    if (response.data.error) throw new Error(response.data.msg);
    return response.data.data.filter(Boolean).sort();
  },
};

export default geographicService;
