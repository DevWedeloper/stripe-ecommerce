import { InjectionToken, Provider, Type } from '@angular/core';

type ProviderRecipe<T> =
  | { useValue: T }
  | { useClass: Type<T> }
  | { useExisting: Type<T> }
  | { useFactory: () => T };

export const createProvider = <T>(
  token: InjectionToken<T>,
  recipe: ProviderRecipe<T>,
): Provider => {
  return {
    provide: token,
    ...recipe,
  };
};
