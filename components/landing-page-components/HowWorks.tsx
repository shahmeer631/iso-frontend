// app/page.tsx
import type { NextPage } from "next";
import Link from "next/link";
import { ArrowRight, Mail } from "lucide-react"; // optional icon library
import Image from "next/image";

const HowWorks: NextPage = () => {
  return (
    <main className=" bg-[#F3F4F6] text-black select-none">
      {/* Hero / How it Works Section */}
      <section className="py-[100px] px-5 sm:px-8 md:px-12 lg:px-16 xl:px-20">
        <div className="max-w-7xl mx-auto">
          <h1
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-4 tracking-tight"
            data-aos="fade-up"
          >
            How ISOBRain.aiWorks
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-6 lg:gap-10 mt-16 md:mt-20">
            {/* Step 1 */}
            <div
              className="relative group bg-[#FFFFFF] rounded-2xl shadow-lg"
              data-aos="fade-up"
              data-aos-delay="100"
            >
              <div className="absolute -inset-0.5   transition duration-500"></div>
              <div className="relative  p-8 h-full flex flex-col">
                <div className="w-14 h-14 rounded-full mx-autobg-[#00f0ff] text-[#0F111A] text-white flex items-center justify-center text-lg font-bold text-cyan-400 mb-6">
                  1
                </div>
                <h3 className="text-xl font-semibold mb-4">Select Context</h3>
                <p className="text-center text-sm">
                  Choose your industry & job role
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div
              className="relative group bg-[#FFFFFF] rounded-2xl shadow-lg"
              data-aos="fade-up"
              data-aos-delay="200"
            >
              <div className="absolute -inset-0.5   transition duration-500"></div>
              <div className="relative  p-8 h-full flex flex-col">
                <div className="w-14 h-14 mx-auto rounded-fullbg-[#00f0ff] text-[#0F111A] text-white flex items-center justify-center text-lg font-bold text-cyan-400 mb-6">
                  2
                </div>
                <h3 className="text-xl font-semibold mb-4">Learn AI</h3>
                <p className="text-center text-sm">
                  Watch lessons + use AI tools
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div
              className="relative group bg-[#FFFFFF] rounded-2xl shadow-lg"
              data-aos="fade-up"
              data-aos-delay="300"
            >
              <div className="absolute -inset-0.5   transition duration-500"></div>
              <div className="relative  p-8 h-full flex flex-col">
                <div className="w-14 h-14 mx-auto rounded-fullbg-[#00f0ff] text-[#0F111A] text-white flex items-center justify-center text-lg font-bold text-cyan-400 mb-6">
                  3
                </div>
                <h3 className="text-xl font-semibold mb-4">
                  Measure Competency
                </h3>
                <p className="text-center text-sm">
                  Get your personalized skill report
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
    </main>
  );
};

export default HowWorks;
