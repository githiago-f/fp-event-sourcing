import { Describable, describedBy } from "../utils/describers";
import { removeFunctions } from "../utils/remove-fn";

export type Copy<T> = { -readonly [P in keyof T]: Copy<T[P]> };
export type BaseEvent<Key extends PropertyKey, T = unknown> = { eventType: Key; data: T };

export interface Applier<T = any, E = any> {
  (currentValue: Copy<T>, event: Readonly<E>): Readonly<T>;
}

export type Aggregate<T, eventKey extends PropertyKey, E> = T & {
  commit(): Aggregate<T, eventKey, E>;
  fold<B>(fn: (agg: Aggregate<T, eventKey, E>) => B): B;
  putEvent(event: E): Aggregate<T, eventKey, E>;
  peekChanges(): readonly BaseEvent<eventKey, E>[];
} & Describable;

export const aggregateRoot = <A extends Record<PropertyKey, Applier>>(appliers: A) => {
  type Key = keyof A;
  type T = A[Key] extends Applier<infer TT extends object, any> ? TT : object;
  type DataFor<K extends Key> = A[K] extends Applier<T, infer D> ? D : never;
  type EventFor<K extends Key> = { eventType: K; data: DataFor<K> };
  type EventUnion = { [K in Key]: EventFor<K> }[Key];
  type Agg = Aggregate<T, Key, EventUnion>;

  const aggregatePrototype = (initialData?: T, uncommitedChanges: EventUnion[] = []): Agg => {
    const data: T = uncommitedChanges.reduce(
      (acc, e) => appliers[e.eventType as Key](structuredClone(acc) as Copy<T>, e.data),
      removeFunctions(initialData ?? {})
    );

    const putEvent = <K extends Key>(event: EventFor<K>) => aggregatePrototype(initialData, [...uncommitedChanges, event]);

    return {
      ...data,
      putEvent,
      peekChanges: () => uncommitedChanges,
      commit: () => aggregatePrototype(data, []),
      fold: (fn) => fn(aggregatePrototype(data, uncommitedChanges)),
      ...describedBy({ kind: 'aggregate', name: 'AggregateRoot' })
    } as Agg;
  };

  return aggregatePrototype;
}

