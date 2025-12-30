import { Aggregate, BaseEvent } from "./aggregate";
import { Mediator } from "./mediator";
import { WriteRepository } from "./repository";

export const aggregateService = <F extends (aggregateId: string, event: BaseEvent<string, any>) => string>(
  repository: WriteRepository<BaseEvent<any, any>, string>,
  mediator: Mediator,
  idGenerator: F,
) => ({
  async commit(aggregate: Aggregate<any, any, any>) {
    const messages = aggregate.peekChanges().map((e: BaseEvent<string, any>) => ({
      type: e.eventType,
      data: e.data,
      id: idGenerator(aggregate.id, e),
    }));

    await repository.saveAll(aggregate.peekChanges());
    await mediator(messages);
    return aggregate.commit();
  }
})
