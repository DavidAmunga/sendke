import { createFileRoute, useLoaderData } from "@tanstack/react-router";
import { Home } from ".";
import type { PaymentForm } from "@/types/PaymentForm";
import { formatPhoneNumber } from "@/lib/helpers";

const SendMoneyHome = () => {
  const { params, formattedPhone } = useLoaderData({ from: "/$phoneNumber" });

  const formDefaults: Partial<PaymentForm> = {
    paymentType: "SEND_MONEY",
    phoneNumber: formattedPhone,
    title: "SEND MONEY",
    showName: true,
    showQrCode: true,
  };

  return <Home formDefaults={formDefaults} />;
};

export const Route = createFileRoute("/$phoneNumber")({
  loader: async ({ params }) => {
    const formattedPhone = formatPhoneNumber(params.phoneNumber);

    return {
      params,
      formattedPhone,
    };
  },
  head: ({ loaderData }) => {
    const { formattedPhone } = loaderData;

    return {
      meta: [
        {
          title: `Send Money to ${formattedPhone} - send.ke`,
        },
        {
          name: "description",
          content: `Create a professional payment poster for sending money to ${formattedPhone}. Generate QR codes and download high-quality payment posters instantly.`,
        },
        {
          property: "og:title",
          content: `Send Money to ${formattedPhone} - send.ke`,
        },
        {
          property: "og:description",
          content: `Create a professional payment poster for sending money to ${formattedPhone}. Generate QR codes and download high-quality payment posters instantly.`,
        },
        {
          property: "og:image",
          content: "/sendke_ogimage_phone.jpg",
        },
        {
          property: "og:url",
          content: `https://send.ke/${formattedPhone.replace(/\s/g, "")}`,
        },
        {
          name: "twitter:card",
          content: "summary_large_image",
        },
        {
          name: "twitter:title",
          content: `Send Money to ${formattedPhone} - send.ke`,
        },
        {
          name: "twitter:description",
          content: `Create a professional payment poster for sending money to ${formattedPhone}. Generate QR codes and download high-quality payment posters instantly.`,
        },
        {
          name: "twitter:image",
          content: "/sendke_ogimage_phone.jpg",
        },
      ],
    };
  },
  component: SendMoneyHome,
});
