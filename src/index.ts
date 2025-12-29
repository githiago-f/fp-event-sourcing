import { Events } from "./domain/entities";
import { invoice, invoiceAggregate } from "./domain/invoice-aggregate";
import { monetary } from "./domain/monetary";
import { Aggregate } from "./mixins/aggregate";
import { EventPublisher, mediator } from "./mixins/mediator";

const eventData = {
  caNumber: 'ca23142',
  product: {
    id: 'id#123',
    code: 'billing-code',
    price: monetary(20.93)
  },
  sellingPrice: 19.99
}
const newInvoice = invoice(invoiceAggregate().putEvent({ eventType: 'invoice_created', data: eventData }));

const checkpointInvoice = invoice(invoiceAggregate(newInvoice));

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

const emit = (agg: Aggregate<any, any, any>) => {
  const es = agg.peekChanges()
    .map((e: any) => ({ type: e.eventType, id: 'group-id', data: e.data }));
  mediator(publisher)(es);
  return agg.commit();
}

const emited = emit(cancelled);
const emited2 = emit(newInvoice);

console.log({ emmited: emited, emmited2: emited2 });

