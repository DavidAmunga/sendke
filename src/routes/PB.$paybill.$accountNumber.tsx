import { createFileRoute, useLoaderData } from "@tanstack/react-router";
import { Home } from ".";
import type { PaymentForm } from "@/types/PaymentForm";
import { formatBusinessNumber, formatAccountNumber } from "@/lib/helpers";

const PaybillHome = () => {
  const { formattedPaybill, formattedAccount } = useLoaderData({
    from: "/PB/$paybill/$accountNumber",
  });

  const formDefaults: Partial<PaymentForm> = {
    paymentType: "PAYBILL",
    paybillNumber: formattedPaybill,
    accountNumber: formattedAccount,
    title: "PAYBILL",
    showName: false,
    showQrCode: false,
  };

  return <Home formDefaults={formDefaults} />;
};

export const Route = createFileRoute("/PB/$paybill/$accountNumber")({
  loader: async ({ params }) => {
    const formattedPaybill = formatBusinessNumber(params.paybill);
    const formattedAccount = formatAccountNumber(params.accountNumber);

    return {
      params,
      formattedPaybill,
      formattedAccount,
    };
  },
  head: ({ loaderData }) => {
    const { formattedPaybill, formattedAccount } = loaderData as {
      formattedPaybill: string;
      formattedAccount: string;
    };

    return {
      meta: [
        {
          title: `Payment Poster for Paybill ${formattedPaybill} - Account ${formattedAccount} - send.ke`,
        },
        {
          name: "description",
          content: `Make a professional payment poster for paybill ${formattedPaybill} with account number ${formattedAccount}. Make high-quality payment posters instantly.`,
        },
        {
          property: "og:title",
          content: `Payment Poster for Paybill ${formattedPaybill} - Account ${formattedAccount} - send.ke`,
        },
        {
          property: "og:description",
          content: `Make a professional payment poster for paybill ${formattedPaybill} with account number ${formattedAccount}. Make high-quality payment posters instantly.`,
        },
        {
          property: "og:image",
          content: "https://send.ke/sendke_ogimage_paybill.jpg",
        },
        {
          property: "og:url",
          content: `https://send.ke/PB/${formattedPaybill.replace(/\s/g, "")}/${formattedAccount.replace(/\s/g, "")}`,
        },
        {
          name: "twitter:card",
          content: "summary_large_image",
        },
        {
          name: "twitter:title",
          content: `Payment Poster for Paybill ${formattedPaybill} - Account ${formattedAccount} - send.ke`,
        },
        {
          name: "twitter:description",
          content: `Make a professional payment poster for paybill ${formattedPaybill} with account number ${formattedAccount}. Make high-quality payment posters instantly.`,
        },
        {
          name: "twitter:image",
          content: "https://send.ke/sendke_ogimage_paybill.jpg",
        },
      ],
    };
  },
  component: PaybillHome,
});
