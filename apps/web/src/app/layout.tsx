import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Image from "next/image";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nutrición V9",
  description: "Tu análisis nutricional personalizado basado en tu perfil de salud",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <main className="flex-1">
          {children}
        </main>
        <footer className="bg-white border-t border-gray-100 py-4 px-6">
          <div className="max-w-5xl mx-auto flex items-center justify-center gap-3">
            <span className="text-xs text-gray-400">Desarrollado por</span>
            <Image
              src="/Logo.png"
              alt="VitalCross AI"
              width={120}
              height={32}
              className="object-contain opacity-70"
            />
          </div>
        </footer>
      </body>
    </html>
  );
}