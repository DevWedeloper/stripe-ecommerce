import {
  dematerialize,
  filter,
  map,
  materialize,
  ObservableInput,
  ObservableNotification,
  pipe,
  share,
  switchMap,
} from 'rxjs';

type DataProducer<T, K> = (input: K) => ObservableInput<T>;

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
