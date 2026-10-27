import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Pacifico } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";

// Importación de componentes globales
import Footer from "@/components/layout/Footer";
import CookieConsentBanner from "@/components/CookieConsentBanner";
import { Toaster } from "@/components/ui/Toaster"; // <- Importamos el gestor de Toasts

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
});

const pacifico = Pacifico({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pacifico",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.aywnaccesorios.cl';
const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export const metadata: Metadata = {
  title: {
    default: "AYUWN - Accesorios para el Cabello | Accesorios y Coles para el Cabello",
    template: "%s | AYUWN",
  },
  description: "Tienda oficial de accesorios, coles, scrunchies y complementos para el cabello en Talca. Diseños únicos y cuidado para tu pelo.",
  keywords: ["coles", "scrunchies", "accesorios de pelo", "moda", "Talca", "Chile", "accesorios para el cabello"],
  authors: [{ name: "AYUWN" }],
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "AYUWN - Accesorios para el Cabello",
    description: "Encuentra scrunchies, coles y accesorios únicos para el cabello. Envíos a todo Chile y entregas en Talca.",
    url: siteUrl,
    siteName: "AYUWN",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "AYUWN - Accesorios para el Cabello",
      },
    ],
    locale: "es_CL",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AYUWN | Accesorios para el Cabello",
    description: "Catálogo oficial de coles, scrunchies y accesorios para el cabello.",
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="es"
      className={`${jakarta.variable} ${pacifico.variable}`}
    >
      <body className="bg-neutral-50 text-ink antialiased">
        <div className="root-content-wrapper min-h-screen flex flex-col">
          {children}
        </div>

        <Footer />
        <CookieConsentBanner />
        
        {/* Gestor global de toasts con físicas en la esquina inferior */}
        <Toaster />

        {/* Carga optimizada de Google Analytics */}
        {gaId && <GoogleAnalytics gaId={gaId} />}
      </body>
    </html>
  );
}