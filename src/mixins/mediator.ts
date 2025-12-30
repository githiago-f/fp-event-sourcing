export interface Message<T> {
  id: string;
  type: string;
  data: T;
}

export interface EventPublisher<T = any> {
  (events: readonly Message<T>[]): Promise<void>;
}

export interface Mediator {
  <T>(events: readonly Message<T>[]): Promise<void>
}

export const mediator = (publish: EventPublisher) =>
  async <T>(events: readonly Message<T>[]) => {
    if (events.length === 0) return;
    await publish(events);
  };

