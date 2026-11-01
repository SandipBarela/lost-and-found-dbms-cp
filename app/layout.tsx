import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Perspective Tunnel Hero",
  description: "3D Perspective Tunnel Hero Component",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white m-0 p-0 overflow-x-hidden transition-colors duration-300">
        {children}
      </body>
    </html>
  );
}

