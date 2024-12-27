import { getAllCountries } from 'src/db/data-access/country/get-all-countries';
import { publicProcedure, router } from '../trpc';

export const countriesRouter = router({
  getAll: publicProcedure.query(async () => await getAllCountries()),
});
