import { PublicNavbar } from "@/components/layout/public-navbar";
import { PublicFooter } from "@/components/layout/public-footer";
import { HeroSection } from "@/components/landing/hero-section";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { ChoosePathSection } from "@/components/landing/choose-path-section";
import { GuidePreviewSection } from "@/components/landing/guide-preview-section";

export default function LandingPage() {
  return (
    <>
      <PublicNavbar />
      <main className="flex-1">
        <HeroSection />
        <HowItWorksSection />
        <FeaturesSection />
        <ChoosePathSection />
        <GuidePreviewSection />
      </main>
      <PublicFooter />
    </>
  );
}
