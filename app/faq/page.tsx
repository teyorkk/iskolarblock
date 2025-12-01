import { FAQPageClient } from "@/components/faq/faq-page-client";

export const metadata = {
  title: "FAQ - IskolarBlock",
  description:
    "Frequently asked questions about IskolarBlock scholarship management system",
};

// Static page with daily revalidation (FAQ content rarely changes)
export const revalidate = 86400; // 24 hours

export default function FAQPage() {
  return <FAQPageClient />;
}
