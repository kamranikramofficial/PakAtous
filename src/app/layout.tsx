import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: {
    default: "PakAutoSe Generators - Quality Generators, Parts & Services",
    template: "%s | PakAutoSe Generators",
  },
  description:
    "Your trusted source for quality generators, genuine parts, and professional generator services in Pakistan. Shop now for the best deals!",
  keywords: [
    "generators",
    "generator parts",
    "generator services",
    "power generators",
    "diesel generators",
    "Pakistan",
    "generator repair",
    "generator maintenance",
  ],
  authors: [{ name: "PakAutoSe" }],
  creator: "PakAutoSe",
  openGraph: {
    type: "website",
    locale: "en_PK",
    url: process.env.NEXT_PUBLIC_APP_URL,
    title: "PakAutoSe Generators",
    description:
      "Your trusted source for quality generators, genuine parts, and professional services.",
    siteName: "PakAutoSe Generators",
  },
  twitter: {
    card: "summary_large_image",
    title: "PakAutoSe Generators",
    description:
      "Your trusted source for quality generators, genuine parts, and professional services.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${poppins.variable} font-sans antialiased`}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
