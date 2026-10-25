import Image from "next/image";
import React from "react";

interface CTCBannerProps {
  title?: string;
  buttonText?: string;
  imageSrc?: string;
}

const CTCBanner = ({ title, buttonText, imageSrc }: CTCBannerProps) => {
  return (
    <section className="flex justify-center py-12 px-6 bg-[var(--ib-bg)]">
      <div
        className="w-full max-w-[1180px] overflow-hidden rounded-3xl bg-[var(--ib-dk)] text-[var(--ib-dktx)]"
        data-aos="zoom-in"
        data-aos-duration="800"
      >
        <div className="flex flex-col lg:flex-row items-center justify-between p-8 sm:p-12 gap-12">
          {/* Left Content Side */}
          <div className="flex-1 text-left space-y-8">
            <h2
              className="text-[var(--ib-dktx)] text-3xl sm:text-4xl font-bold leading-[1.12] tracking-tight max-w-xl"
              data-aos="fade-up"
              data-aos-duration="700"
              data-aos-delay="200"
            >
              {title}
            </h2>

            <button
              className="ib-btn px-8 py-3 text-[15px] font-semibold rounded-[10px] bg-white text-[#0B1530] border-white cursor-pointer"
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
