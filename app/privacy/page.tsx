import { PrivacyPageClient } from "@/components/privacy/privacy-page-client";

export const metadata = {
  title: "User Assistance Guidelines & Data Privacy - IskolarBlock",
  description:
    "User assistance guidelines and data privacy policy in accordance with the Data Privacy Act of 2012",
};

// Static page with daily revalidation (privacy policy rarely changes)
export const revalidate = 86400; // 24 hours

export default function PrivacyPage() {
  return <PrivacyPageClient />;
}
