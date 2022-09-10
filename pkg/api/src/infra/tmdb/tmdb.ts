import { Zodios } from '@zodios/core';

import { tmdbApiKey } from '@/config/env';
import { pluginQuery } from '@/utils/zodios';

import { DiscoverAPI } from './discover/discover';
import { MovieAPI } from './movie/movies';
import { TrendingAPI } from './trending/trending';
import { TVAPI } from './tv/tv';

export const TMDBAPI = new Zodios('https://api.themoviedb.org/3', [
  ...DiscoverAPI,
  ...MovieAPI,
  ...TVAPI,
  ...TrendingAPI,
]);
TMDBAPI.use(pluginQuery('api_key', async () => tmdbApiKey));
