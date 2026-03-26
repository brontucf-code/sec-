import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SEC 办理推广内容系统",
  description: "Multi-site SEO content admin"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
