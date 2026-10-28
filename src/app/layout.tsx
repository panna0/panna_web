import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import { NavBar } from "@/components/NavBar";
import { pally } from "@/fonts/pally";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Panna",
  description: "Panna — studio website",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="it"
      className={`${geistSans.variable} ${geistMono.variable} ${pally.variable} h-full scroll-smooth antialiased`}
      suppressHydrationWarning
    >
      <body className="max-w-full min-h-full overflow-x-hidden font-sans">
        <Script id="intro-opened" strategy="beforeInteractive">
          {`try{if(localStorage.getItem("panna-intro-opened")==="1")document.documentElement.dataset.introOpened="1"}catch(e){}`}
        </Script>
        <NavBar />
        {children}
      </body>
    </html>
  );
}
