import type { Metadata } from "next";
import { Poppins, Lora } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Laufbahn | Bewerbungen entspannt organisieren",
  description:
    "Organisiere Bewerbungen, Gespräche, Fristen und Unterlagen an einem klaren Ort. Laufbahn begleitet deine Jobsuche in Deutschland und Österreich.",
  icons: {
    icon: [{ url: "/images/laufbahn-favicon.png", type: "image/png" }],
    apple: [{ url: "/images/laufbahn-favicon.png" }],
    shortcut: "/images/laufbahn-favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body className={`${poppins.variable} ${lora.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
