import { removeFunctions } from "../utils/remove-fn";

export type Copy<T> = { -readonly [P in keyof T]: Copy<T[P]> };
export type BaseEvent<Key extends PropertyKey, T = unknown> = Readonly<{ eventType: Key; data: Readonly<T> }>;

export interface Applier<T = any, E = any> {
  (currentValue: Copy<T>, event: Readonly<E>): Readonly<T>;
}

export type Aggregate<T, eventKey extends PropertyKey, E> = Readonly<
  T & {
    id: string,
    commit(): Aggregate<T, eventKey, E>;
    putEvent<K extends eventKey>(event: BaseEvent<K, E extends any ? E : never>): Aggregate<T, eventKey, E>;
    peekChanges(): BaseEvent<eventKey, E>[];
  }
>;

export function aggregateRoot<
  A extends Record<PropertyKey, Applier>
>(appliers: A) {
  type Key = keyof A;
  type T = A[Key] extends Applier<infer TT extends object, any> ? TT : object;
  type DataFor<K extends Key> = A[K] extends Applier<T, infer D> ? D : never;
  type EventFor<K extends Key> = Readonly<{ eventType: K; data: Readonly<DataFor<K>> }>;
  type EventUnion = { [K in Key]: EventFor<K> }[Key];

  const aggregatePrototype = (initialData?: T, uncommitedChanges: readonly EventUnion[] = []) => {
    const data = uncommitedChanges.reduce(
      (acc, e) => appliers[e.eventType as Key](structuredClone(acc) as Copy<T>, e.data),
      removeFunctions(initialData ?? ({} as T)) as Readonly<T>
    ) as T;

    const putEvent = <K extends Key>(event: EventFor<K>) =>
      aggregatePrototype(initialData, [...uncommitedChanges, event]);

    const commit = () => aggregatePrototype(data as T, []);

    const peekChanges = () => uncommitedChanges;

    return {
      ...data,
      commit,
      putEvent,
      peekChanges,
    };
  };

  return aggregatePrototype;
}

