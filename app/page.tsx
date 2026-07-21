import { PublicNavbar } from "@/components/layout/public-navbar";
import { PublicFooter } from "@/components/layout/public-footer";
import { HeroSection } from "@/components/landing/hero-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { GuidePreviewSection } from "@/components/landing/guide-preview-section";

export default function LandingPage() {
  return (
    <>
      <PublicNavbar />
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <GuidePreviewSection />
      </main>
      <PublicFooter />
    </>
  );
}
