import { randomUUID } from "node:crypto";
import { aggregateRoot, Applier } from "./mixins/aggregate";
import { monetary, Monetary } from "./monetary";

const invoiceStatus = {
  new: 'new',
  processing: 'processing',
  refused: 'refused',
  active: 'active',
  cancelled: 'cancelled',
} as const;

const chargeStatus = {
  paid: 'paid',
  cancelled: 'cancelled',
  approved: 'approved',
  refunded: 'refunded',
  billed: 'billed',
  created: 'created',
} as const;

type ChargeStatusType = typeof chargeStatus;
type ChargeStatus = keyof ChargeStatusType;
type InvoiceStatusType = typeof invoiceStatus;
type InvoiceStatus = keyof InvoiceStatusType;

type Month = `0${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9}` | '11' | '12';
type ReferenceMonth = `${string}/${Month}`;

type Charge = {
  invoice: string,
  status: ChargeStatus,
  paidAmount: Monetary,
  referenceMonth: ReferenceMonth;
}

type Product = {
  id: string,
  code: string,
  price: Monetary,
}

type Invoice = {
  id: string,
  contractAccountNumber: string,
  status: InvoiceStatus,
}

type InvoiceAggregate = Invoice & {
  product: { id: string, sellingPrice: Monetary },
  charges: Charge[],
}

type InvoiceCreatedEvent = { product: Product, sellingPrice: number, caNumber: string }

const Events = {
  invoice_created: 'invoice_created',
  product_price_changed: 'product_price_changed',
  paid_charge: 'paid_charge',
} as const;

const invoiceCreatedHandler: Applier<InvoiceAggregate, InvoiceCreatedEvent> = (curr, i) => {
  curr.product = {
    id: i.product.id,
    sellingPrice: monetary(i.sellingPrice),
  };

  curr.id = randomUUID();
  curr.contractAccountNumber = i.caNumber;
  curr.status = invoiceStatus.new;
  return curr;
}

const paidChargeHandler: Applier<InvoiceAggregate, { paidAmount: Monetary, charge: { product: string } }> = (curr) => {
  return curr;
}

const invoiceAggregate = (initialData: InvoiceCreatedEvent) => {
  const base = aggregateRoot({
    [Events.invoice_created]: invoiceCreatedHandler,
    [Events.paid_charge]: paidChargeHandler,
  })().putEvent({
    eventType: 'invoice_created',
    data: initialData
  });

  return {
    ...base,
  }
}

const sold = invoiceAggregate({
  caNumber: 'ca23142',
  product: {
    id: 'id#123',
    code: 'billing-code',
    price: monetary(20.93)
  },
  sellingPrice: 19.99
});

console.log(sold);
console.log(sold.peekChanges());

