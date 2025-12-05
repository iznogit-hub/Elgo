import { Metadata } from "next";
import { ContactClient } from "@/components/pages/contact-client";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with t7sen for collaborations, inquiries, or feedback.",
};

export default function ContactPage() {
  return <ContactClient />;
}
