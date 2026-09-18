"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Footer from "@/sheard/Footer";
import Navbar from "@/sheard/Navbar";
import { Toaster } from "sonner";

import { Provider } from "react-redux";
import { store } from "@/lib/redux/store";
import AuthHydrator from "@/components/auth/AuthHydrator";
import GlobalChatbot from "@/components/landing-page-components/GlobalChatbot";

const ClientWrapper = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();

  // Define authentication/admin routes where common layout should be excluded
  const isAuthRoute =
    pathname?.includes("/auth") ||
    pathname?.includes("/dashboard") ||
    pathname?.includes("/profile") ||
    pathname?.includes("/ai-assistant");

  return (
    <Provider store={store}>
      <Toaster richColors position="top-center" />
      <AuthHydrator>
        {!isAuthRoute && <Navbar />}
        <main className="select-none">{children}</main>
        {!isAuthRoute && <GlobalChatbot />}
        {!isAuthRoute && <Footer />}
      </AuthHydrator>
    </Provider>
  );
};

export default ClientWrapper;
