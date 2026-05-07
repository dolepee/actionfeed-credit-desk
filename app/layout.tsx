import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://creditgate.vercel.app"),
  title: "CreditGate",
  description: "0G-native agent credit, spend caps, and refusal receipts.",
  icons: {
    icon: "/icon.svg",
  },
  openGraph: {
    title: "CreditGate",
    description: "0G-native agent credit, spend caps, and refusal receipts.",
    siteName: "CreditGate",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html data-theme="dark" lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem("creditgate-theme");document.documentElement.dataset.theme=t==="light"?"light":"dark"}catch(e){document.documentElement.dataset.theme="dark"}`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
