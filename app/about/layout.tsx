import { Metadata } from "next";

export const metadata: Metadata = {
  title: "t7sen | About",
  description: "Software Architect & Developer - About Me",
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
