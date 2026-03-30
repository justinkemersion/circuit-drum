import type { Metadata } from "next";
import { Share_Tech_Mono } from "next/font/google";
import "./globals.css";

const shareTech = Share_Tech_Mono({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-share-tech",
});

export const metadata: Metadata = {
  title: "CircuitDrum — Analog Sequencer",
  description: "Retro-futuristic 16-step drum machine powered by Tone.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={shareTech.variable}>
      <body className="font-display">{children}</body>
    </html>
  );
}
