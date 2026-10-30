import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Rohit Suthar — Aspiring Data Engineer",
  description:
    "Portfolio of Rohit Suthar, fresher Data Engineer from Udaipur, India. Python, SQL, PySpark, Databricks, Kafka, Azure — building reliable data pipelines and end-to-end products.",
  keywords: [
    "Rohit Suthar",
    "Data Engineer",
    "PySpark",
    "Databricks",
    "SQL",
    "Apache Kafka",
    "Azure",
    "Portfolio",
  ],
  authors: [{ name: "Rohit Suthar" }],
  icons: {
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='7' fill='%2308090B'/%3E%3Ccircle cx='16' cy='16' r='7' fill='%23536C83'/%3E%3C/svg%3E",
  },
  openGraph: {
    title: "Rohit Suthar — Aspiring Data Engineer",
    description:
      "Building reliable data pipelines with Python, SQL, PySpark, Databricks & Kafka.",
    siteName: "Rohit Suthar",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rohit Suthar — Aspiring Data Engineer",
    description:
      "Building reliable data pipelines with Python, SQL, PySpark, Databricks & Kafka.",
  },
};

export const viewport: Viewport = {
  themeColor: "#08090B",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body
        className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable} antialiased bg-[#08090B] text-[#E6E9ED]`}
      >
        {children}
      </body>
    </html>
  );
}
