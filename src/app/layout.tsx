import localFont from "next/font/local";
import "~/styles/globals.css";

import { ClerkProvider } from "@clerk/nextjs";
import { type Metadata } from "next";

import { Toaster } from "~/components/ui/sonner";
import { TRPCReactProvider } from "~/trpc/react";

export const metadata: Metadata = {
  title: "Orora",
  description: "This time you'll catch the northern lights.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const ClashGrotesk = localFont({
  src: [
    {
      path: "../../public/fonts/ClashGrotesk-Variable.ttf",
    },
  ],
  variable: "--font-clash-grotesk",
});

const Satoshi = localFont({
  src: [
    {
      path: "../../public/fonts/Satoshi-Variable.ttf",
    },
  ],
  variable: "--font-satoshi",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <TRPCReactProvider>
        <html
          lang="en"
          className={`${ClashGrotesk.variable} ${Satoshi.variable}`}
        >
          <body>
            {children}
            <Toaster />
          </body>
        </html>
      </TRPCReactProvider>
    </ClerkProvider>
  );
}
