import { Events } from "./domain/entities";
import { invoice, makeAggregate } from "./domain/invoice-aggregate";
import { monetary } from "./domain/monetary";
import { BaseEvent } from "./mixins/aggregate";
import { aggregateService } from "./mixins/aggregate-service";
import { EventPublisher, mediator } from "./mixins/mediator";
import { writeRepository } from "./mixins/repository";

const eventData = {
  data: {
    caNumber: 'ca23142',
    product: {
      id: 'id#123',
      code: 'billing-code',
      price: monetary(20.93)
    },
    sellingPrice: 19.99
  },
  eventType: Events.invoice_created,
};

const replayableInvoice = invoice(makeAggregate().putEvent(eventData));

const checkpointInvoice = invoice(makeAggregate(replayableInvoice));
const cancelled = checkpointInvoice.cancel();

type Handlers = Record<string, (event: any) => Promise<void>>;
export const InMemoryPublisher = (handlers: Handlers): EventPublisher => async (es) => {
  const handler = (type: string) => handlers[type] ?? ((e) => console.error('Invalid event', e));
  const result = es.map(e => handler(e.type)(e));
  await Promise.all(result);
}

const publisher = InMemoryPublisher({
  [Events.invoice_created]: async (event) => console.log('Invoice created ->', event),
});

const emitter = mediator(publisher);
const eventStore = writeRepository<BaseEvent<any, any>, string>({
  async save(_) { },
  async delete(_) { },
  async findById(_) { return []; },
});

const verySimpleHash = (s: string) => s.split('').map(i => i.charCodeAt(0)).reduce((acc, i) => { acc += i; return acc; }, 0).toString(16);
const service = aggregateService(eventStore, emitter, (id, event) => id + verySimpleHash(JSON.stringify(event.data)));

service.commit(replayableInvoice);
service.commit(cancelled);

