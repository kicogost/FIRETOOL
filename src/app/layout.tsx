import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FIRE Tracker",
  description:
    "Tu camino hacia la independencia financiera, en euros y paso a paso.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-white text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}
