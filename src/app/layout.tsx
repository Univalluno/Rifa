import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Rifa Solidaria",
  description:
    "Rifa solidaria: participa con una boleta de $15.000 y gana $500.000. Tu aporte será de gran ayuda. ¡Gracias por apoyar y compartir! Juega con las dos últimas cifras de chontico noche 9 de octubre de 2026.",
  openGraph: {
    title: "Rifa Solidaria",
    description:
      "Rifa solidaria: participa con una boleta de $15.000 y gana $500.000. Tu aporte será de gran ayuda. ¡Gracias por apoyar y compartir! Juega con las dos últimas cifras de chontico noche 9 de octubre de 2026.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.variable} ${playfair.variable} antialiased`}>
        {children}
        <Toaster
          position="top-center"
          theme="dark"
          toastOptions={{
            style: {
              background: "#0B0B0F",
              border: "1px solid #F5C518",
              color: "#FFFFFF",
            },
          }}
        />
      </body>
    </html>
  );
}