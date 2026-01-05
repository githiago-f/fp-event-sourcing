import { Events } from "./domain/entities";
import { invoiceCancelledHandler, invoiceCreatedHandler } from "./domain/event-appliers";
import { invoice } from "./domain/invoice-aggregate";
import { aggregateRoot } from "./mixins/aggregate";
import { buildSchema } from "./utils/describers";

const aggregatePrototype = aggregateRoot({
  [Events.invoice_created]: invoiceCreatedHandler,
  [Events.invoice_cancelled]: invoiceCancelledHandler,
});

invoice(aggregatePrototype());
console.log(buildSchema());
