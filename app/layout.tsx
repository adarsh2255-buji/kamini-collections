import type { Metadata } from "next";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/cart-context";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s | Kamini Collections",
    default: "Kamini Collections | Authentic Handloom, Silk & Bridal Sarees",
  },
  description:
    "Discover authentic handcrafted Banarasi, Kanchipuram, Chanderi, and Linen sarees at Kamini Collections. Premium Indian ethnic wear with Pan-India delivery and Cash on Delivery.",
  keywords: [
    "Kamini Collections",
    "Sarees India",
    "Banarasi Silk Saree",
    "Kanchipuram Silk Saree",
    "Bridal Saree",
    "Handloom Sarees",
    "Traditional Sarees Online",
  ],
  authors: [{ name: "Kamini Collections" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${plusJakarta.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-[#FAF7F0] text-[#26221F]">
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
