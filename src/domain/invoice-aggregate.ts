import { aggregateRoot } from "../mixins/aggregate.ts";
import { Events } from "./entities";
import { invoiceCancelledHandler, invoiceCreatedHandler } from './event-appliers.ts';

const appliers = {
  [Events.invoice_cancelled]: invoiceCancelledHandler,
  [Events.invoice_created]: invoiceCreatedHandler,
}

export const makeAggregate = aggregateRoot(appliers);

export const invoice = (agg = makeAggregate()) => ({
  ...agg,
  putEvent: (e: Parameters<typeof agg.putEvent>[0]) => invoice(agg.putEvent(e)),
  commit: () => invoice(agg.commit()),
  cancel: () => invoice(agg.putEvent({
    eventType: Events.invoice_cancelled,
    data: {},
  }))
});

