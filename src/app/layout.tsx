import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "FRED BLACK — Aviation Intelligence Platform",
  description:
    "Real-time flight tracking, geopolitical risk assessment and fleet intelligence for Eastern African aviation insurers and operators.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark" className={inter.variable}>
      <body className="font-body">{children}</body>
    </html>
  );
}
