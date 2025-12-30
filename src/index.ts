import { Events } from "./domain/entities";
import { invoice, makeAggregate } from "./domain/invoice-aggregate";
import { monetary } from "./domain/monetary";
import { Aggregate } from "./mixins/aggregate";
import { EventPublisher, mediator } from "./mixins/mediator";

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

const newInvoice = invoice(makeAggregate().putEvent(eventData));

const checkpointInvoice = invoice(makeAggregate(newInvoice));

console.log({ newInvoice, checkpointInvoice });
console.log(newInvoice.peekChanges());

const cancelled = checkpointInvoice.cancel();

console.log({ cancelled });
console.log(cancelled.peekChanges());

type Handlers = Record<string, (event: any) => Promise<void>>;
export const InMemoryPublisher = (handlers: Handlers): EventPublisher => async (es) => {
  const handler = (type: string) => handlers[type] ?? ((e) => console.error('Invalid event', e));
  const result = es.map(e => handler(e.type)(e));
  await Promise.all(result);
}

const publisher = InMemoryPublisher({
  [Events.invoice_created]: async (event) => console.log('Invoice created ->', event),
});

const sendEvent = (agg: Aggregate<any, any, any>) => {
  const es = agg.peekChanges()
    .map((e: any) => ({ type: e.eventType, id: 'group-id', data: e.data }));
  mediator(publisher)(es);
  return agg.commit();
}

const emited = sendEvent(newInvoice);
const emited2 = sendEvent(cancelled);

console.log({ emited, emited2 });

