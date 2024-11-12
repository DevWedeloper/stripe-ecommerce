import {
  dematerialize,
  filter,
  map,
  materialize,
  merge,
  Observable,
  ObservableInput,
  ObservableNotification,
  pipe,
  share,
  startWith,
  switchMap,
  take,
} from 'rxjs';

type DataProducer<T, K> = (input: K) => ObservableInput<T>;

type StatusStreams<TLoading, TSuccess, TError> = {
  loading: Observable<TLoading>;
  success: Observable<TSuccess>;
  error: Observable<TError>;
};

export const materializeAndShare = <T, K>(dataProducer: DataProducer<T, K>) =>
  pipe(switchMap(dataProducer), materialize(), share());

export const successStream = <T>() =>
  pipe(
    filter(
      (notification: ObservableNotification<T>) => notification.kind === 'N',
    ),
    dematerialize(),
  );

export const errorStream = <T>() =>
  pipe(
    filter(
      (notification: ObservableNotification<T>) => notification.kind === 'E',
    ),
    map((notification) => new Error(notification.error)),
  );

export const statusStream = <TLoading, TSuccess, TError>({
  loading,
  success,
  error,
}: StatusStreams<TLoading, TSuccess, TError>) =>
  merge(
    loading.pipe(map(() => 'loading' as const)),
    success.pipe(map(() => 'success' as const)),
    error.pipe(map(() => 'error' as const)),
  ).pipe(startWith('initial' as const));

export const initialLoading = () =>
  pipe(
    map(() => false),
    take(1),
    startWith(true),
  );
