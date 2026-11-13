"use client";

import React, { Suspense } from "react";
import { usePathname } from "next/navigation";
import Footer from "@/sheard/Footer";
import Navbar from "@/sheard/Navbar";
import { Toaster } from "sonner";

import { Provider } from "react-redux";
import { store } from "@/lib/redux/store";
import AuthHydrator from "@/components/auth/AuthHydrator";
import GlobalChatbot from "@/components/landing-page-components/GlobalChatbot";
import { AskAiPageContextProvider } from "@/components/ask-ai/AskAiPageContext";
import ApiUsageBanner from "@/components/api-usage/ApiUsageBanner";

const ClientWrapper = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();

  // Marketing chrome (nav/footer) stays off dense app shells
  const hideMarketingChrome =
    pathname?.includes("/auth") ||
    pathname?.includes("/dashboard") ||
    pathname?.includes("/profile") ||
    pathname?.includes("/ai-assistant");

  // Universal Ask AI: available on every page except auth
  const showUniversalChat = !pathname?.includes("/auth");
  const showUsageBanner = !pathname?.includes("/auth");

  return (
    <Provider store={store}>
      <Toaster richColors position="top-center" />
      <AuthHydrator>
        <AskAiPageContextProvider>
          {!hideMarketingChrome && <Navbar />}
          {showUsageBanner && (
            <Suspense fallback={null}>
              <ApiUsageBanner />
            </Suspense>
          )}
          <main className="select-none">{children}</main>
          {showUniversalChat && (
            <Suspense fallback={null}>
              <GlobalChatbot />
            </Suspense>
          )}
          {!hideMarketingChrome && <Footer />}
        </AskAiPageContextProvider>
      </AuthHydrator>
    </Provider>
  );
};

export default ClientWrapper;
