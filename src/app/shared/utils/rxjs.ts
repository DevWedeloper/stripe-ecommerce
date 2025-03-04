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

type ToggleDisable<TEnable, TDisable> = {
  enable: Observable<TEnable>;
  disable: Observable<TDisable>;
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

const mapToState = (state: 'loading' | 'success' | 'error') =>
  pipe(map(() => state));

const mapToLoading = () => mapToState('loading');
const mapToSuccess = () => mapToState('success');
const mapToError = () => mapToState('error');

export const statusStream = <TLoading, TSuccess, TError>({
  loading,
  success,
  error,
}: StatusStreams<TLoading, TSuccess, TError>) =>
  merge(
    loading.pipe(mapToLoading()),
    success.pipe(mapToSuccess()),
    error.pipe(mapToError()),
  ).pipe(startWith('initial' as const));

export const finalizedStatusStream = <TSuccess, TError>({
  success,
  error,
}: Omit<StatusStreams<never, TSuccess, TError>, 'loading'>) =>
  merge(success.pipe(mapToSuccess()), error.pipe(mapToError()));

export const initialLoading = () =>
  pipe(
    map(() => false),
    take(1),
    startWith(true),
  );

export const toggleDisableStream = <TEnable, TDisable>({
  enable,
  disable,
}: ToggleDisable<TEnable, TDisable>) =>
  merge(enable.pipe(map(() => false)), disable.pipe(map(() => true)));
