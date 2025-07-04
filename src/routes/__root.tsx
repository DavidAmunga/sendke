import {
  Outlet,
  HeadContent,
  Scripts,
  createRootRoute,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { seo } from "@/utils/seo";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      ...seo({
        title:
          "send.ke | Make Simple Payment Posters for any mobile money payment method",
        description: `Create beautiful, shareable payment posters with any mobile money payment method. Perfect for businesses, freelancers, and anyone who needs to receive mobile payments.`,
      }),
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      {
        rel: "icon",
        type: "image/x-icon",
        href: "/favicon.ico",
        sizes: "16x16 32x32",
      },
      {
        rel: "icon",
        type: "image/png",
        href: "/icon-192.png",
        sizes: "192x192",
      },
      {
        rel: "shortcut icon",
        href: "/favicon.ico",
      },
      {
        rel: "apple-touch-icon",
        sizes: "180x180",
        href: "/apple-touch-icon.png",
      },
      {
        rel: "manifest",
        href: "/manifest.json",
      },
    ],
  }),

  component: () => (
    <RootDocument>
      <Header />

      <body>
        <div className="min-h-screen flex flex-col bg-gray-100 overflow-x-hidden relative">
          {/* Dotted background pattern */}
          <div
            className="absolute h-full w-full inset-0 pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(#3b82f6 0.5px, transparent 0.5px), radial-gradient(#3b82f6 0.5px, transparent 0.5px)",
              backgroundSize: "10px 10px",
              backgroundPosition: "0 0, 10px 10px",
              opacity: 0.2,
            }}
          />
          <Header />

          <main className="flex flex-col">
            <Outlet />
          </main>

          <Footer />
        </div>
      </body>
    </RootDocument>
  ),
});

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}
