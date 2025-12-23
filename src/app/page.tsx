import { HomeContent } from "@/components/home/HomeContent";
import { CTASection } from "@/components/home/CTASection";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <HomeContent />
      <CTASection />
    </div>
  );
}

