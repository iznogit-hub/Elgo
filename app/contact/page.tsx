import { Metadata } from "next";
import { ContactClient } from "@/components/pages/contact-client";

export const metadata: Metadata = {
  title: "Contact", // This will become "Contact | t7sen" via the layout template
};

export default function ContactPage() {
  return <ContactClient />;
}
