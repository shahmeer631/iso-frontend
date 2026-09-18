"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";


export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white text-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center gap-6 max-w-md"
      >
        <Image
          src="/404-travel.svg"
          alt="Not found illustration"
          width={320}
          height={240}
          className="mx-auto"
        />

        <h1 className="text-2xl">Oops! Destination not found.</h1>

        <p className="text-gray-600 leading-relaxed">
          The page you’re looking for doesn’t exist or may have been moved. Try
          exploring our latest travel deals below.
        </p>

        <Button
          size="lg"
          className="bg-green-700 hover:bg-green-800"
          asChild
        >
          <Link href="/" className="mt-4">
            Back to Home
          </Link>
        </Button>
      </motion.div>
    </div>
  );
}
