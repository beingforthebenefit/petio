import cors from '@koa/cors';
import { StatusCodes } from 'http-status-codes';
import Koa from 'koa';
import koaBody from 'koa-body';
import compress from 'koa-compress';
import helmet from 'koa-helmet';
import morgan from 'koa-morgan';
import mount from 'koa-mount';

import routes from '@/api/index';
import { IsDevelopment, corsDomains } from '@/config/env';
import { config } from '@/config/index';
import { removeSlashes } from '@/infra/util/urls';
import logger from '@/loaders/logger';

export default ({ app }: { app: Koa }) => {
  // Add http logging using morgan
  app.use(
    morgan((tokens: any, req: any, res: any) => {
      const msg = [
        tokens.method(req, res),
        tokens.url(req, res),
        tokens.status(req, res),
        tokens.res(req, res, 'content-length'),
        '-',
        tokens['response-time'](req, res),
        'ms',
      ].join(' ');
      logger.http(msg);
      return null;
    }, {}),
  );

  // Add error handling
  app.use(async (ctx, next) => {
    // call our next middleware
    try {
      await next();
    } catch (error) {
      ctx.status =
        error.statusCode || error.status || StatusCodes.INTERNAL_SERVER_ERROR;
      error.status = ctx.status;
      ctx.body = { error };
      ctx.app.emit('error', error, ctx);
    }
  });

  // Enable trusted proxies
  app.proxy = true;

  // Implement important security headers
  app.use(
    helmet.contentSecurityPolicy({
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", 'https://www.youtube.com'],
        styleSrc: ["'self'", "'unsafe-inline'"],
        fontSrc: ["'self'"],
        frameSrc: ["'self'", 'unsafe-inline', 'https://www.youtube.com'],
        imgSrc: [
          "'self'",
          'data:',
          'https://plex.tv',
          'https://*.plex.tv',
          'https://*.tmdb.org',
          'https://assets.fanart.tv',
          'https://secure.gravatar.com',
        ],
        connectSrc: ["'self'", 'https://plex.tv'],
      },
    }),
  );

  // Enable cors
  const whitelist = corsDomains.split(',').map((domain) => domain.trim());
  if (IsDevelopment()) {
    // add local react dev
    whitelist.push('http://localhost:3000');
  }

  const corsOptions = {
    origin: async (ctx: Koa.Context): Promise<string> => {
      if (
        ctx.request.header.origin &&
        whitelist.indexOf(ctx.request.header.origin) !== -1
      ) {
        return ctx.request.header.origin;
      } else {
        return 'http://localhost:7777';
      }
    },
    credentials: true,
  };

  app.use(cors(corsOptions));
  app.use(
    compress({
      threshold: 2048,
    }),
  );

  // Enable body parsing
  app.use(koaBody());

  // Load routes
  const subpath = '/' + removeSlashes(config.get('petio.subpath'));
  app.use(mount(subpath, routes(subpath)));

  // Handle errors
  app.on('error', (err) => logger.error(err));
};
