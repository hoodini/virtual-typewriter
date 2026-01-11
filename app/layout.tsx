import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Virtual Typewriter | 1960s Mechanical Typewriter Simulator",
  description: "An immersive virtual typewriter web application that authentically simulates using a 1960s mechanical typewriter. Experience the tactile joy of vintage typing with realistic sounds, typebar animations, and authentic imperfections.",
  keywords: ["typewriter", "vintage", "1960s", "mechanical", "simulator", "typing", "retro", "antique"],
  authors: [{ name: "Virtual Typewriter" }],
  openGraph: {
    title: "Virtual Typewriter | 1960s Mechanical Typewriter Simulator",
    description: "Experience the authentic feel of a 1960s mechanical typewriter in your browser.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#1A1A1A",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Special+Elite&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
