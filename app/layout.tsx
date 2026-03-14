import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "App Chassis",
  description: "Premium dark-mode internal tool & AI workspace starter",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );
}
