import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ActionFeed Credit Desk",
  description: "0G-native credit and authority layer for autonomous agents.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

