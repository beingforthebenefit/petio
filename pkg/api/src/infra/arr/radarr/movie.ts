import { asApi } from '@zodios/core';
import { z } from 'zod';

export const MovieSchema = z.object({
  id: z.number(),
  title: z.string(),
  originalTitle: z.string(),
  originalLanguage: z.object({ id: z.number(), name: z.string() }),
  alternateTitles: z.array(
    z.object({
      id: z.number(),
      sourceType: z.string(),
      movieMetadataId: z.number(),
      title: z.string(),
      cleanTitle: z.string(),
      sourceId: z.number(),
      votes: z.number(),
      voteCount: z.number(),
      language: z.object({ id: z.number(), name: z.string() }),
    }),
  ),
  secondaryYear: z.number(),
  secondaryYearSourceId: z.number(),
  sortTitle: z.string(),
  sizeOnDisk: z.number(),
  status: z.string(),
  overview: z.string(),
  inCinemas: z.string(),
  physicalRelease: z.string(),
  digitalRelease: z.string(),
  physicalReleaseNote: z.string(),
  images: z.array(
    z.object({
      coverType: z.string(),
      url: z.string(),
      remoteUrl: z.string(),
    }),
  ),
  website: z.string(),
  remotePoster: z.string(),
  year: z.number(),
  hasFile: z.boolean(),
  youTubeTrailerId: z.string(),
  studio: z.string(),
  path: z.string(),
  qualityProfileId: z.number(),
  monitored: z.boolean(),
  minimumAvailability: z.string(),
  isAvailable: z.boolean(),
  folderName: z.string(),
  runtime: z.number(),
  cleanTitle: z.string(),
  imdbId: z.string(),
  tmdbId: z.number(),
  titleSlug: z.string(),
  rootFolderPath: z.string(),
  folder: z.string(),
  certification: z.string(),
  genres: z.array(z.string()),
  tags: z.array(z.number()),
  added: z.string(),
  addOptions: z
    .object({
      ignoreEpisodesWithFiles: z.boolean().optional(),
      ignoreEpisodesWithoutFiles: z.boolean().optional(),
      searchForMovie: z.boolean().optional(),
    })
    .optional(),
  ratings: z.object({
    imdb: z.object({
      votes: z.number(),
      value: z.number(),
      type: z.string(),
    }),
    tmdb: z.object({
      votes: z.number(),
      value: z.number(),
      type: z.string(),
    }),
    metacritic: z.object({
      votes: z.number(),
      value: z.number(),
      type: z.string(),
    }),
    rottenTomatoes: z.object({
      votes: z.number(),
      value: z.number(),
      type: z.string(),
    }),
  }),
  movieFile: z.object({
    id: z.number(),
    movieId: z.number(),
    relativePath: z.string(),
    path: z.string(),
    size: z.number(),
    dateAdded: z.string(),
    sceneName: z.string(),
    indexerFlags: z.number(),
    quality: z.object({
      quality: z.object({
        id: z.number(),
        name: z.string(),
        source: z.string(),
        resolution: z.number(),
        modifier: z.string(),
      }),
      revision: z.object({
        version: z.number(),
        real: z.number(),
        isRepack: z.boolean(),
      }),
      hardcodedSubs: z.string(),
    }),
    customFormats: z.array(
      z.object({
        id: z.number(),
        name: z.string(),
        includeCustomFormatWhenRenaming: z.boolean(),
        specifications: z.array(
          z.object({
            id: z.number(),
            name: z.string(),
            implementation: z.string(),
            implementationName: z.string(),
            infoLink: z.string(),
            negate: z.boolean(),
            required: z.boolean(),
            fields: z.array(
              z.object({
                order: z.number(),
                name: z.string(),
                label: z.string(),
                unit: z.string(),
                helpText: z.string(),
                helpLink: z.string(),
                type: z.string(),
                advanced: z.boolean(),
                selectOptions: z.array(
                  z.object({
                    value: z.number(),
                    name: z.string(),
                    order: z.number(),
                    hint: z.string(),
                    dividerAfter: z.boolean(),
                  }),
                ),
                selectOptionsProviderAction: z.string(),
                section: z.string(),
                hidden: z.string(),
                placeholder: z.string(),
              }),
            ),
            presets: z.array(z.null()),
          }),
        ),
      }),
    ),
    mediaInfo: z.object({
      id: z.number(),
      audioBitrate: z.number(),
      audioChannels: z.number(),
      audioCodec: z.string(),
      audioLanguages: z.string(),
      audioStreamCount: z.number(),
      videoBitDepth: z.number(),
      videoBitrate: z.number(),
      videoCodec: z.string(),
      videoDynamicRangeType: z.string(),
      videoFps: z.number(),
      resolution: z.string(),
      runTime: z.string(),
      scanType: z.string(),
      subtitles: z.string(),
    }),
    originalFilePath: z.string(),
    qualityCutoffNotMet: z.boolean(),
    languages: z.array(z.object({ id: z.number(), name: z.string() })),
    releaseGroup: z.string(),
    edition: z.string(),
  }),
  collection: z.object({
    name: z.string(),
    tmdbId: z.number(),
    images: z.array(
      z.object({
        coverType: z.string(),
        url: z.string(),
        remoteUrl: z.string(),
      }),
    ),
  }),
  popularity: z.number(),
});
export const MoviesSchema = z.array(MovieSchema);

export type Movie = z.infer<typeof MovieSchema>;
export type Movies = z.infer<typeof MovieSchema>;

export const MovieEndpoint = asApi([
  {
    method: 'get',
    path: '/api/v3/movie',
    parameters: [
      {
        name: 'tmdbid',
        type: 'Query',
        schema: z.number().positive().optional(),
      },
    ],
    response: MoviesSchema,
  },
  {
    method: 'get',
    path: '/api/v3/movie/:id',
    parameters: [],
    response: MovieSchema,
  },
  {
    method: 'get',
    path: '/api/v3/movie/lookup',
    parameters: [
      {
        name: 'term',
        type: 'Query',
        schema: z.string().optional(),
      },
    ],
    response: MovieSchema,
  },
  {
    method: 'post',
    path: '/api/v3/movie',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: MovieSchema,
      },
    ],
    response: MovieSchema,
  },
  {
    method: 'delete',
    path: '/api/v3/movie/:id',
    parameters: [],
    response: z.object({}),
  },
]);
