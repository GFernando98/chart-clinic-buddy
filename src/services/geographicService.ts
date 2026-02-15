import axios from 'axios';

const BASE_URL = 'https://api.countrystatecity.in/v1';
const API_KEY = 'e6182c2469cc2ffad8255604d601a844270d8593b90836a3a26fb17cd0617c82';

const cscClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'X-CSCAPI-KEY': API_KEY },
});

interface CSCCountry {
  id: number;
  name: string;
  iso2: string;
}

interface CSCState {
  id: number;
  name: string;
  iso2: string;
}

interface CSCCity {
  id: number;
  name: string;
}

export const geographicService = {
  async getCountries(): Promise<{ name: string; iso2: string }[]> {
    const { data } = await cscClient.get<CSCCountry[]>('/countries');
    return data.map((c) => ({ name: c.name, iso2: c.iso2 })).sort((a, b) => a.name.localeCompare(b.name));
  },

  async getStates(countryIso2: string): Promise<{ name: string; iso2: string }[]> {
    const { data } = await cscClient.get<CSCState[]>(`/countries/${countryIso2}/states`);
    return data.map((s) => ({ name: s.name, iso2: s.iso2 })).sort((a, b) => a.name.localeCompare(b.name));
  },

  async getCities(countryIso2: string, stateIso2: string): Promise<string[]> {
    const { data } = await cscClient.get<CSCCity[]>(`/countries/${countryIso2}/states/${stateIso2}/cities`);
    return data.map((c) => c.name).sort();
  },
};

export default geographicService;
