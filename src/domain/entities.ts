import { Monetary } from "./monetary";

type Month = `0${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9}` | '11' | '12';
type ReferenceMonth = `${string}/${Month}`;

export const invoiceStatus = {
  new: 'new',
  processing: 'processing',
  refused: 'refused',
  active: 'active',
  cancelled: 'cancelled',
} as const;

export const chargeStatus = {
  paid: 'paid',
  cancelled: 'cancelled',
  approved: 'approved',
  refunded: 'refunded',
  billed: 'billed',
  created: 'created',
} as const;

type ChargeStatusType = typeof chargeStatus;
export type ChargeStatus = keyof ChargeStatusType;

type InvoiceStatusType = typeof invoiceStatus;
export type InvoiceStatus = keyof InvoiceStatusType;

export type Product = {
  id: string,
  code: string,
  price: Monetary,
}

export type Charge = {
  status: ChargeStatus,
  paidAmount: Monetary,
  referenceMonth: ReferenceMonth;
}

export type Invoice = {
  id: string,
  contractAccountNumber: string,
  status: InvoiceStatus,
}

export type InvoiceAggregate = Invoice & {
  product: { id: string, sellingPrice: Monetary },
  charges: Charge[],
}

export type InvoiceCreatedEvent = { product: Product, sellingPrice: number, caNumber: string }

export const Events = {
  invoice_created: 'invoice_created',
  invoice_cancelled: 'invoice_cancelled',
} as const;

export type InvoiceEventType = typeof Events;
export type InvoiceEvent = keyof InvoiceEventType;
