"use client";
import * as React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Image from "next/image";
import Autoplay from "embla-carousel-autoplay";

import brand1 from "@/public/Samsung-icon.png";
import brand2 from "@/public/ABB-icon.png";
import brand3 from "@/public/Canon-icon.png";
import brand4 from "@/public/CAT-icon.png";
import brand5 from "@/public/DHL-icon.png";
import brand6 from "@/public/Nestle-icon.png";
import brand7 from "@/public/PepsiCo-icon.png";
import brand8 from "@/public/Schneider-icon.png";
import brand9 from "@/public/3M-icon.png";
// import brand10 from "@/public/Uniliver-icon.png";

const BrandName = () => {
  const brands = [brand1, brand2, brand3, brand4, brand5, brand6, brand7, brand8, brand9];

  return (
    <section dir="ltr" className="bg-[#0F111A] py-12 border-b border-white/5 overflow-hidden [direction:ltr]">
      <div className="container mx-auto px-4" dir="ltr">
        <div
          className="relative"
          dir="ltr"
          data-aos="fade-up"
          data-aos-duration="1000"
        >
          <Carousel
            plugins={[
              Autoplay({
                delay: 2000,
                stopOnInteraction: false,
              }),
            ]}
            opts={{
              align: "start",
              loop: true,
              direction: "ltr",
            }}
            className="w-full"
            dir="ltr"
          >
            <CarouselContent className="-ml-4 flex items-center" dir="ltr">
              {brands.map((brand, index) => (
                <CarouselItem
                  key={index}
                  className="pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/7"
                >
                  <div className="flex items-center justify-center px-8 transition-all duration-500 cursor-pointer">
                    <Image
                      src={brand}
                      alt={`brand-${index}`}
                      width={120}
                      height={120}
                      className="object-contain"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>

          <div className="absolute top-0 left-0 w-24 h-full bg-gradient-to-r from-[#0F111A] to-transparent z-10 pointer-events-none" />
          <div className="absolute top-0 right-0 w-24 h-full bg-gradient-to-l from-[#0F111A] to-transparent z-10 pointer-events-none" />
        </div>
      </div>
    </section>
  );
};

export default BrandName;
