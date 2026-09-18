import ReviewSection from "@/components/AIAssistant/ReviewSection";
import BrandName from "@/components/landing-page-components/BrandName";

import HeroSection from "@/components/landing-page-components/HeroSection";

import ISOPlatform from "@/components/landing-page-components/ISOPlatform";


export default function Home() {
  return (
    <div className="text-center">
      <HeroSection />
      <BrandName />
      <ISOPlatform />
      <ReviewSection />
    </div>
  );
}
