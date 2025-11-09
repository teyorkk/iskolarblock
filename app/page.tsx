"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/components/session-provider";
import { Loading } from "@/components/loading";
import { isAdmin } from "@/lib/utils/auth";
import { LandingNavigation } from "@/components/landing/landing-navigation";
import { LandingHero } from "@/components/landing/landing-hero";
import { LandingFeatures } from "@/components/landing/landing-features";
import { LandingAbout } from "@/components/landing/landing-about";
import { LandingFooter } from "@/components/landing/landing-footer";
import { landingFeatures } from "@/lib/constants/landing-features";

export default function Home() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  const { ready, user } = useSession();
  const hydrated = ready && typeof window !== "undefined";

  useEffect(() => {
    if (!hydrated) return;
    if (user) {
      // If user is logged in, redirect based on role
      const redirectPath = isAdmin(user)
        ? "/admin-dashboard"
        : "/user-dashboard";
      router.push(redirectPath);
    }
  }, [hydrated, user, router]);

  // Show loading while checking session or redirecting
  if (!hydrated || user) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white">
      <LandingNavigation
        isMobileMenuOpen={isMobileMenuOpen}
        onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      />
      <LandingHero />
      <LandingFeatures features={landingFeatures} />
      <LandingAbout />
      <LandingFooter />
    </div>
  );
}
