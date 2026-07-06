import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Goflow Partner Collective",
  description:
    "Browse the marketplace and retail expansion programs Goflow can open for your brand — and request a warm intro.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
