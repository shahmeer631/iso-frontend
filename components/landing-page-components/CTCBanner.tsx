import Image from "next/image";
import React from "react";

interface CTCBannerProps {
  title?: string;
  buttonText?: string;
  imageSrc?: string;
}

const CTCBanner = ({ title, buttonText, imageSrc }: CTCBannerProps) => {
  return (
    <section className="flex justify-center py-12 px-6 bg-[#111827]">
      <div
        className="w-full max-w-7xl overflow-hidden rounded-[32px] bg-gradient-to-br from-[#312E81] via-[#111827] to-[#312E81]"
        data-aos="zoom-in"
        data-aos-duration="800"
      >
        <div className="flex flex-col lg:flex-row items-center justify-between p-8 pl-12  gap-12">
          {/* Left Content Side */}
          <div className="flex-1 text-left space-y-8">
            <h1
              className="text-white text-3xl sm:text-4xl md:text-5xl font-bold leading-[1.2] tracking-tight max-w-xl"
              data-aos="fade-up"
              data-aos-duration="700"
              data-aos-delay="200"
            >
              {title}
            </h1>

            <button
              className="px-10 py-3 lg:px-10 lg:py-3bg-[#00f0ff] text-[#0F111A]  text-white text-lg font-medium rounded-full  cursor-pointer"
              data-aos="fade-up"
              data-aos-duration="700"
              data-aos-delay="400"
            >
              {buttonText}
            </button>
          </div>

          {/* Right Image Side */}
          <div className="flex-1 w-full max-w-3xl">
            <div className="relative group">
              {/* Soft Glow behind image */}

              <div
                className="relative overflow-hidden"
                data-aos="fade-left"
                data-aos-duration="800"
                data-aos-delay="300"
              >
                <Image
                  src={imageSrc || "/CTC-dashboard.png"} // Replace with your actual image path
                  alt={imageSrc || "Dashboard Preview"}
                  width={357}
                  height={180}
                  className="w-full h-auto object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTCBanner;
