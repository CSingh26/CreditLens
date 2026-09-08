import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CreditLens",
  description: "Credit default risk scoring with explainability and fairness diagnostics.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={"bg-[var(--background)] text-[var(--foreground)] antialiased"}
      >
        {children}
      </body>
    </html>
  );
}
