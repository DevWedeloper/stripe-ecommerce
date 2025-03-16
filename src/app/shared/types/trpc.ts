import { InjectionToken } from '@angular/core';
import { TrpcClient } from 'src/trpc-client';

export type Trpc =
  typeof TrpcClient extends InjectionToken<infer U> ? U : never;
