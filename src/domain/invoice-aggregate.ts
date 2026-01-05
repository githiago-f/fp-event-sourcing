import { Aggregate } from "../mixins/aggregate";
import { implementing, observe } from "../utils/describers";
import { Events, InvoiceAggregate, InvoiceCreatedEvent, InvoiceEvent } from "./entities";

type AggregateEvents<K extends InvoiceEvent> = {
  [Events.invoice_cancelled]: {}
  [Events.invoice_created]: InvoiceCreatedEvent
}[K];

type Agg = Aggregate<InvoiceAggregate, InvoiceEvent, AggregateEvents<InvoiceEvent>>;

export const invoice = observe((agg: Agg) => implementing(agg)('Invoices', {
  cancel: () => agg.putEvent({ eventType: Events.invoice_cancelled, data: {} }).fold(invoice),
  putEvent: (e: Parameters<typeof agg.putEvent>[0]) => agg.putEvent(e).fold(invoice),
  commit: () => agg.commit().fold(invoice),
  fold: undefined,
}));


