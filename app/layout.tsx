import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

const title = "QueuePilot — Customer support operations console";
const description =
  "A local-first support queue for triage, ownership, SLA risk, replies, and operational reporting.";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("host") ?? "localhost:3000";
  const protocol = host.startsWith("localhost") ? "http" : "https";
  const metadataBase = new URL(`${protocol}://${host}`);

  return {
    metadataBase,
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: [{ url: "/og.png", width: 1536, height: 1024, alt: "QueuePilot support operations console" }],
    },
    twitter: { card: "summary_large_image", title, description, images: ["/og.png"] },
    other: { google: "notranslate" },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" translate="no" className="notranslate"><body>{children}</body></html>;
}
