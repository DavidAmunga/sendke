export type PaymentType = "SEND_MONEY" | "PAYBILL" | "TILL_NUMBER";

export interface PaymentForm {
  paymentType: PaymentType;
  phoneNumber?: string;
  paybillNumber?: string;
  accountNumber?: string;
  tillNumber?: string;
  name?: string;
  selectedColor: string;
  showName: boolean;
  showQrCode: boolean;
  title: string;
  fontScale: number;
}

export interface Template {
  name: string;
  slug: string;
  description: string;
  size: {
    width: number;
    height: number;
    label: string;
  };
}
