import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Taxclara.az — Bəyannamə hazırlama və uyğunsuzluq auditi",
  description:
    "Azərbaycan müəssisələri üçün vergi bəyannaməsi hazırlama və uyğunsuzluq auditi platforması.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="az">
      <body>
        <div className="wrap">{children}</div>
      </body>
    </html>
  );
}
