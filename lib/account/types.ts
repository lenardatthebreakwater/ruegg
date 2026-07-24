export type AccountOrderLineItemImage = {
  sourceUrl: string | null;
  altText: string | null;
};

export type AccountOrderLineItem = {
  name: string;
  slug: string | null;
  quantity: number;
  total: string | null;
  image: AccountOrderLineItemImage | null;
};

export type AccountOrderAddress = {
  firstName: string | null;
  lastName: string | null;
  address1: string | null;
  address2: string | null;
  postcode: string | null;
  city: string | null;
  country: string | null;
  email?: string | null;
  phone?: string | null;
};

export type AccountCustomerAddress = {
  firstName: string | null;
  lastName: string | null;
  company: string | null;
  address1: string | null;
  address2: string | null;
  postcode: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  email?: string | null;
  phone?: string | null;
};

export type AccountAddresses = {
  billing: AccountCustomerAddress;
  shipping: AccountCustomerAddress;
};

export type AccountPaymentMethod = {
  id: number;
  type: string;
  gatewayId: string | null;
  gatewayTitle: string | null;
  brand: string | null;
  last4: string | null;
  expiryMonth: string | null;
  expiryYear: string | null;
  isDefault: boolean;
  display: string;
};

export type AccountOrderSummary = {
  id: number;
  orderNumber: string;
  date: string | null;
  status: string;
  statusLabel: string;
  total: string | null;
  needsPayment: boolean;
  paymentMethodTitle: string | null;
  payUrl: string | null;
};

/** Customer-facing note from Woo (email) or SMS snippet (private note with --- body). */
export type AccountOrderCustomerNote = {
  id: number;
  type: "email" | "sms";
  date: string | null;
  content: string;
};

export type AccountOrderDetail = AccountOrderSummary & {
  lineItems: AccountOrderLineItem[];
  billing: AccountOrderAddress | null;
  shipping: AccountOrderAddress | null;
  datePaid: string | null;
  dateCompleted: string | null;
  customerNotes: AccountOrderCustomerNote[];
};
