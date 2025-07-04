import { createFileRoute, useLoaderData } from "@tanstack/react-router";
import { Home } from ".";
import type { PaymentForm } from "@/types/PaymentForm";
import { formatBusinessNumber } from "@/lib/helpers";

const TillHome = () => {
  const { formattedTill } = useLoaderData({
    from: "/BG/$tillNumber",
  });

  const formDefaults: Partial<PaymentForm> = {
    paymentType: "TILL_NUMBER",
    tillNumber: formattedTill,
    title: "TILL NUMBER",
    showName: false,
    showQrCode: false,
  };

  return <Home formDefaults={formDefaults} />;
};

export const Route = createFileRoute("/BG/$tillNumber")({
  loader: async ({ params }) => {
    const formattedTill = formatBusinessNumber(params.tillNumber);

    return {
      params,
      formattedTill,
    };
  },
  head: ({ loaderData }) => {
    const { formattedTill } = loaderData;

    return {
      meta: [
        {
          title: `Till Number ${formattedTill} - send.ke`,
        },
        {
          name: "description",
          content: `Create a professional payment poster for till number ${formattedTill}. Generate QR codes and download high-quality payment posters instantly.`,
        },
        {
          property: "og:title",
          content: `Till Number ${formattedTill} - send.ke`,
        },
        {
          property: "og:description",
          content: `Create a professional payment poster for till number ${formattedTill}. Generate QR codes and download high-quality payment posters instantly.`,
        },
        {
          property: "og:image",
          content: "/sendke_ogimage_till.jpg",
        },
        {
          property: "og:url",
          content: `https://send.ke/BG/${formattedTill.replace(/\s/g, "")}`,
        },
        {
          name: "twitter:card",
          content: "summary_large_image",
        },
        {
          name: "twitter:title",
          content: `Till Number ${formattedTill} - send.ke`,
        },
        {
          name: "twitter:description",
          content: `Create a professional payment poster for till number ${formattedTill}. Generate QR codes and download high-quality payment posters instantly.`,
        },
        {
          name: "twitter:image",
          content: "/sendke_ogimage_till.jpg",
        },
      ],
    };
  },
  component: TillHome,
});
