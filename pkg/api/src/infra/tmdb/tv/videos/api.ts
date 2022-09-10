import { asApi } from '@zodios/core';

import { VideosParams } from './params';
import { VideoSchema } from './schemas';

export const VideosAPI = asApi([
  {
    method: 'get',
    path: '/tv/:id/videos',
    parameters: VideosParams,
    response: VideoSchema,
  },
]);
