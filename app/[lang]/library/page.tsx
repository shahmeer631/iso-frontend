import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import LibraryUseCases from "@/components/Library/LibraryUseCases";
import FAQ from "@/components/AIAssistant/FAQ";
import { Button } from "@/components/ui/button";
import SlidingButton from "@/components/Library/SlidingButton";
import CTCBanner from "@/components/landing-page-components/CTCBanner";
interface FAQItem {
  question: string;
  answer: string;
}
const faqData: FAQItem[] = [
  {
    question: "What is openup content writing tool?",
    answer:
      "Once you know your audience, choose a topic that will resonate with them. Look for trending topics in your industry or address common questions or challenges your audience may be facing.",
  },
  {
    question: "What Languages Does It Supports?",
    answer:
      "Our GenAI supports over 50+ languages, allowing you to create content for a global audience with localized nuances and cultural relevance.",
  },
  {
    question: "What Is SEO Wirting Ai And How Do I Use It?",
    answer:
      "SEO Writing AI is an assistant that helps optimize your content for search engines by suggesting keywords, improving readability, and ensuring your meta tags are perfectly crafted.",
  },
  {
    question: "What Languages Does It Supports?",
    answer:
      "Aside from English, we support Spanish, French, German, Chinese, Japanese, and many more, ensuring seamless translation and content generation.",
  },
  {
    question: "Does Openup To Write Long Articles?",
    answer:
      "Yes, Openup is specifically designed to handle long-form content like blogs, essays, and research papers while maintaining coherence and structure throughout.",
  },
];
const page = () => {
  return (
    <>
      {/* header section  */}
      <section className="w-full bg-[#111827] py-24 text-center text-white">
        <div className="max-w-4xl mx-auto px-4 flex flex-col items-center">
          <h1 className="space-grotesk text-5xl lg:text-[52px] font-semibold text-white mb-6 leading-[1.1] tracking-tight">
            ISO Platform
          </h1>

          <p className="text-[#A1A1A6] text-sm lg:text-lg max-w-4xl mx-auto leading-relaxed mb-10 font-inter">
            Access 250+ ISO standards organized by categories with AI-powered
            insights
          </p>

          {/* Search */}
          <div className="relative w-full max-w-xl">
            <Search className="text-white absolute left-4 top-1/2 -translate-y-1/2 z-10 w-5 h-5" />

            <Input
              placeholder="Search for ISO standards across all categories..."
              className="
          h-14 pl-12 pr-4
          rounded-lg
          bg-white/10
          border border-white/20
          text-white
          placeholder:text-gray-400
          backdrop-blur-md
          focus-visible:ring-2
          focus-visible:ring-white/40
        "
            />
          </div>

          <SlidingButton
            left={{
              label: "Browse by category",
              href: "/library",
            }}
            right={{
              label: "Browse by standards",
              href: "/library/store",
            }}
          />
        </div>
      </section>

      {/* Generate AI Copy writing */}
      <LibraryUseCases />

      {/* FAQ Section */}
      <FAQ faqData={faqData} />


      {/* <section className="w-full bg-[#111827] py-24 text-center text-white">
        <div className="max-w-4xl mx-auto px-4 flex flex-col items-center">
          <h1 className="text-3xl md:text-5xl font-semibold mb-6">
           Ready to Get Started?
          </h1>

          <p className="text-lg md:text-2xl text-gray-300 mb-10">
           Start exploring ISO standards with AI-powered tools
          </p>

         <div className="flex gap-4">
           <button className="bg-white text-base font-bold text-[#4F46E5] px-6 py-3 rounded-lg ">Start Free Trial</button>
           <button className="bg-[#5b5b5f7e] text-base font-bold text-white px-6 py-3 rounded-lg border border-[#6f6f728f]">View Pricing</button>

         </div>
        </div>
      </section> */}

      <CTCBanner
        title="All set to level up
your content game?"
        buttonText="Get Started Free"
        imageSrc="/contentGame.png"
      />

    </>
  );
};

export default page;
