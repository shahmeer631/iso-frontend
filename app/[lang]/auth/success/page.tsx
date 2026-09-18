"use client";

import React, { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "motion/react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { useRouter } from "next/navigation";

const SuccessPage = () => {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/auth/complete-profile");
    }, 2000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/50 p-4">
      <Card className="w-full max-w-md border-none shadow-xl shadow-black/5 p-8">
        <CardContent className="flex flex-col items-center justify-center space-y-6 pt-6">
          {/* Animated Lottie Container */}
          <div className="relative w-48 h-48">
            <DotLottieReact
              src="https://lottie.host/d1686bcd-4b70-47d8-9909-a3e0d1ea1ca7/Y2veQxvLk8.lottie"
              loop
              autoplay
            />
          </div>

          {/* Text Content */}
          <div className="text-center space-y-2">
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold text-gray-900"
            >
              Congratulations!
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-muted-foreground"
            >
              You have successfully created your account .
            </motion.p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SuccessPage;
