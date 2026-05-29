import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Digital Praveen",
  description: "AI Interview Agent",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, width: "100%", minHeight: "100vh", overflow: "hidden" }}>
        {children}
      </body>
    </html>
  );
}