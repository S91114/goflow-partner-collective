import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { RecaptchaScript } from "./RecaptchaScript";

// Inter — self-hosted, licensed-safe stand-in for Goflow's Euclid Circular A.
const inter = localFont({
  src: [
    { path: "./fonts/Inter-Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/Inter-Medium.woff2", weight: "500", style: "normal" },
    { path: "./fonts/Inter-SemiBold.woff2", weight: "600", style: "normal" },
    { path: "./fonts/Inter-Bold.woff2", weight: "700", style: "normal" },
    { path: "./fonts/Inter-ExtraBold.woff2", weight: "800", style: "normal" },
  ],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Goflow",
  description: "Removing friction so sellers can grow.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <RecaptchaScript />
        {children}
      </body>
    </html>
  );
}
