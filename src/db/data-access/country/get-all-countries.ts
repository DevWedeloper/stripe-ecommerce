import { db } from 'src/db';
import { countries, CountrySelect } from 'src/db/schema';

export const getAllCountries = async (): Promise<CountrySelect[]> =>
  db.select().from(countries);
