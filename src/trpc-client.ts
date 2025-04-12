import { createTrpcClient } from '@analogjs/trpc';
import { inject } from '@angular/core';
import { TRPCLink } from '@trpc/client';
import { observable } from '@trpc/server/observable';
import { SuperJSON } from 'superjson';
import { AppRouter } from './server/trpc/routers';

export const cacheLink: TRPCLink<AppRouter> = () => {
  const cache = new Map();

  return ({ next, op }) => {
    const cacheKey = `${op.path}:${JSON.stringify(op.input)}`;
    const isCacheEnabled = op.context['noCache'] !== true;

    if (op.type === 'query' && cache.has(cacheKey) && isCacheEnabled) {
      return observable((observer) => {
        observer.next(cache.get(cacheKey));
        observer.complete();
      });
    }

    if (op.type === 'mutation') {
      cache.clear();
    }

    return observable((observer) => {
      const unsubscribe = next(op).subscribe({
        next(value) {
          const shouldCache = op.type === 'query' && isCacheEnabled;
          if (shouldCache) {
            cache.set(cacheKey, value);
          }
          observer.next(value);
        },
        error(err) {
          observer.error(err);
        },
        complete() {
          observer.complete();
        },
      });
      return unsubscribe;
    });
  };
};

export const { provideTrpcClient, TrpcClient, TrpcHeaders } =
  createTrpcClient<AppRouter>({
    url: '/api/trpc',
    options: {
      transformer: SuperJSON,
      links: [cacheLink],
    },
  });

export function injectTrpcClient() {
  return inject(TrpcClient);
}
