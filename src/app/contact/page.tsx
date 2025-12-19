import { Metadata } from "next";
import { ContactClient } from "@/components/pages/contact-client";

export const metadata: Metadata = {
  title: "Contact",
  description: "Open a secure channel.",
  openGraph: {
    images: [
      "/api/og?title=SECURE_UPLINK&section=CONTACT&description=Initiate%20encrypted%20communication%20channel.",
    ],
  },
};

export default function ContactPage() {
  return <ContactClient />;
}
