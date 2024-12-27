import { getAllCountries as getAllCountriesFromDb } from 'src/db/data-access/country/get-all-countries';
import { CountrySelect } from 'src/db/schema';

export const getAllCountries = async (): Promise<CountrySelect[]> =>
  getAllCountriesFromDb();
