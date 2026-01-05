import { Describable, describedBy } from "../utils/describers";
import { removeFunctions } from "../utils/remove-fn";

export type Copy<T> = { -readonly [P in keyof T]: Copy<T[P]> };
export type BaseEvent<Key extends PropertyKey, T = unknown> = Readonly<{ eventType: Key; data: Readonly<T> }>;

export interface Applier<T = any, E = any> {
  (currentValue: Copy<T>, event: Readonly<E>): Readonly<T>;
}

export type Aggregate<T, eventKey extends PropertyKey, E> = T & {
  commit(): Aggregate<T, eventKey, E>;
  fold<B>(fn: (agg: Aggregate<T, eventKey, E>) => B): B;
  putEvent<K extends eventKey>(event: BaseEvent<K, E extends any ? E : never>): Aggregate<T, eventKey, E>;
  peekChanges(): readonly BaseEvent<eventKey, E>[];
} & Describable;

export const aggregateRoot = <A extends Record<PropertyKey, Applier>>(appliers: A) => {
  type Key = keyof A;
  type T = A[Key] extends Applier<infer TT extends object, any> ? TT : object;
  type DataFor<K extends Key> = A[K] extends Applier<T, infer D> ? D : never;
  type EventFor<K extends Key> = Readonly<{ eventType: K; data: Readonly<DataFor<K>> }>;
  type EventUnion = { [K in Key]: EventFor<K> }[Key];
  type Agg = Aggregate<T, Key, EventUnion>;

  const aggregatePrototype = (initialData?: T, uncommitedChanges: readonly EventUnion[] = []): Agg => {
    const data: T = uncommitedChanges.reduce(
      (acc, e) => appliers[e.eventType as Key](structuredClone(acc) as Copy<T>, e.data),
      removeFunctions(initialData ?? {})
    );

    return {
      ...data,
      putEvent: (event) => aggregatePrototype(initialData, [...uncommitedChanges, event] as readonly EventUnion[]),
      peekChanges: () => uncommitedChanges,
      commit: () => aggregatePrototype(data, []),
      fold: (fn) => fn(aggregatePrototype(data, uncommitedChanges)),
      ...describedBy({ kind: 'aggregate', name: 'AggregateRoot' })
    } as Agg;
  };

  return aggregatePrototype;
}

