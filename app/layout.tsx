import type { Metadata } from "next";
import "./globals.css";
import { Roboto } from "next/font/google";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"], 
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: "DS_Capture",
  description: "Portfolio & Fotografie von DS_Capture – urbane, ästhetische Bildwelten.",
  openGraph: {
    title: "DS_Capture",
    description: "Portfolio & Fotografie von DS_Capture – urbane, ästhetische Bildwelten.",
    url: "https://dscapture.de",
    siteName: "DS_Capture",
    locale: "de_DE",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body className={`${roboto.className}`}>
        {children}
      </body>
    </html>
  );
}
