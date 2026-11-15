import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ReUnite | Campus Lost & Found System",
  description: "ReUnite - Intelligent Campus Lost & Found DBMS with AI matching, claim management, and secure handover.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased bg-[#FAF7F2] text-[#1F2421] font-sans m-0 p-0 overflow-x-hidden selection:bg-[#D95D39]/20 selection:text-[#1F2421]">
        {children}
      </body>
    </html>
  );
}

