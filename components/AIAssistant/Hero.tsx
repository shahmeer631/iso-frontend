import Image from "next/image";
import React from "react";

const LEFT_IMAGE = "/land3.png";
const RIGHT_IMAGE = "/land3.png";
const ARROW_IMAGE = "/arrow.png";

const Hero: React.FC = () => {
  return (
    <section className="w-full py-16 lg:py-0">
      <div className="relative max-w-7xl mx-auto px-6 h-auto lg:h-[650px]">
        {/* 1024–1279 TABLET */}
        <div className="hidden lg:flex xl:hidden items-center justify-between gap-8">
          {/* LEFT */}
          <div className="flex flex-col ml-4 items-start text-left w-1/2 absolute bottom-0 left-0">
            <h3 className="text-xl font-semibold text-[#1e293b] mb-4">
              Select your Option
            </h3>

            <div className="w-[90%] rounded-2xl border border-[#d9def0] bg-white shadow-sm p-4">
              <Image
                src={LEFT_IMAGE}
                alt="option left"
                width={900}
                height={600}
                className="w-full h-auto rounded-xl"
              />
            </div>
          </div>

          {/* ARROW */}
          <Image
            src={ARROW_IMAGE}
            alt="arrow"
            width={80}
            height={80}
            className="absolute top-1/2 h-[500px] w-[70px] left-1/2 transform -translate-x-1/2 -translate-y-1/2 "
          />

          {/* RIGHT */}
          <div className="flex flex-col items-start text-left w-1/2 absolute top-0 right-0">
            <h3 className="text-xl ml-10 font-semibold text-[#1e293b]  mb-4">
              Select your Option
            </h3>

            <div className="w-[90%] ml-10 rounded-2xl border border-[#d9def0] bg-white shadow-sm p-4">
              <Image
                src={RIGHT_IMAGE}
                alt="option right"
                width={900}
                height={600}
                className="w-full h-auto rounded-xl"
              />
            </div>
          </div>
        </div>

        {/* MOBILE / TABLET */}
        <div className="flex flex-col items-center gap-8 lg:gap-12 lg:hidden">
          {/* TOP */}
          <div className="flex flex-col items-start text-left w-full max-w-full">
            <h3 className="text-xl font-semibold text-[#1e293b] mb-4">
              Select your Option
            </h3>

            <div className="w-full rounded-2xl border border-[#d9def0] bg-white shadow-sm p-4">
              <Image
                src={RIGHT_IMAGE}
                alt="option right"
                width={900}
                height={600}
                className="w-full h-auto rounded-xl"
              />
            </div>
          </div>

          {/* ARROW */}
          {/* <div className="relative">

          <Image
            src={ARROW_IMAGE}
            alt="arrow"
            width={10}
            height={10}
            className="w-auto sm:w-[60px] sm:h-[300px] h-auto  absolute bg-green-700 z-20 rotate-90"
            />
            </div> */}

          {/* BOTTOM */}
          <div className="flex flex-col items-start text-left w-full max-w-full">
            <h3 className="text-xl font-semibold text-[#1e293b] mb-4">
              Select your Option
            </h3>

            <div className="w-full rounded-2xl border border-[#d9def0] bg-white shadow-sm p-4">
              <Image
                src={LEFT_IMAGE}
                alt="option left"
                width={900}
                height={600}
                className="w-full h-auto rounded-xl"
              />
            </div>
          </div>
        </div>

        {/* LG RIGHT */}
        <div className="hidden xl:flex absolute bottom-0 left-0 flex-col items-start text-left">
          <h3 className="text-2xl font-semibold text-[#1e293b] mb-6">
            Select your Option
          </h3>

          <div className="lg:w-[560px] rounded-2xl border border-[#d9def0] bg-white shadow-sm p-4">
            <Image
              src={RIGHT_IMAGE}
              alt="option right"
              width={900}
              height={600}
              className="w-full h-auto rounded-xl"
            />
          </div>
        </div>

        {/* LG LEFT */}
        <div className="hidden xl:flex absolute top-0 right-0 flex-col items-start text-left">
          <h3 className="text-2xl font-semibold text-[#1e293b] mb-6">
            Select your Option
          </h3>

          <div className="lg:w-[560px] rounded-2xl border border-[#d9def0] bg-white shadow-sm p-4">
            <Image
              src={LEFT_IMAGE}
              alt="option left"
              width={900}
              height={600}
              className="w-full h-auto rounded-xl"
            />
          </div>
        </div>

        {/* LG ARROW */}
        <div className="hidden xl:flex absolute lg:top-12 inset-0 items-center justify-center pointer-events-none">
          <Image
            src={ARROW_IMAGE}
            alt="arrow"
            width={220}
            height={520}
            className="opacity-80 h-[520px] w-[120px]"
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;
