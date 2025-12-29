import { randomUUID } from "node:crypto";
import { Applier } from "../mixins/aggregate";
import { monetary } from "./monetary";
import { InvoiceAggregate, InvoiceCreatedEvent, invoiceStatus } from "./entities";

export const invoiceCreatedHandler: Applier<InvoiceAggregate, InvoiceCreatedEvent> = (curr, eventData) => {
  curr.product = {
    id: eventData.product.id,
    sellingPrice: monetary(eventData.sellingPrice),
  };

  curr.id = randomUUID();
  curr.contractAccountNumber = eventData.caNumber;
  curr.status = invoiceStatus.new;
  return curr;
}

export const invoiceCancelledHandler: Applier<InvoiceAggregate, {}> = (curr, _: {}) => {
  curr.status = invoiceStatus.cancelled;
  return curr;
};
