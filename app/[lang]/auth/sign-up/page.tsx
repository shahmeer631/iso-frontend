"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import "@/lib/i18n/client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useRegisterMutation } from "@/lib/redux/features/auth/authApi";
import GoogleLoginButton from "@/components/auth/GoogleLoginButton";
import FacebookLoginButton from "@/components/auth/FacebookLoginButton";
import LinkedInLoginButton from "@/components/auth/LinkedInLoginButton";
import AISimulation from "@/components/landing-page-components/AISimulation";

const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid work email address.",
  }),
});

const SignUpPage = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { lang } = useParams();
  const [register, { isLoading, isError }] = useRegisterMutation();
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [isEnterprise, setIsEnterprise] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const emailValue = form.watch("email");

  useEffect(() => {
    const isValid = z.string().email().safeParse(emailValue).success;
    setIsEmailValid(isValid);

    if (isValid) {
      // Simple check for enterprise domains (this would be an API call in a real app)
      const enterpriseDomains = ["microsoft.com", "google.com", "apple.com", "meta.com", "amazon.com", "slack.com"];
      const domain = emailValue.split("@")[1]?.toLowerCase();
      setIsEnterprise(enterpriseDomains.includes(domain));
    } else {
      setIsEnterprise(false);
    }
  }, [emailValue]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await register({ email: values.email }).unwrap();
      router.push(`/auth/otp?email=${encodeURIComponent(values.email)}`);
    } catch (err: any) {
      console.error("Failed to register email:", err);
      toast.error(err?.data?.message || t('auth.signupError', 'Failed to register. Please try again.'));
    }
  }

  return (
    <div className="min-h-screen bg-[#09090B]">
      <div className="container mx-auto flex min-h-screen font-sans selection:bg-brand-cyan text-[#0F111A]/30">
        {/* Left Side: The Canvas (Desktop only) */}
        <div className="hidden lg:flex w-1/2 relative overflow-hidden flex-col justify-between p-12 bg-[#09090B]">


          {/* Logo */}
          <Link href={`/${lang}`} className="relative z-10 flex items-center gap-3">
            <div className="w-10 h-10 bg-[#18181B] border border-[#27272A] rounded-xl flex items-center justify-center p-2 shadow-2xl">
              <Image src="/Icon.png" alt={t('dynamic.dyn_icon_6')} width={24} height={24} />
            </div>
            <span className="text-xl font-bold tracking-tight text-white  font-space-grotesk">ISOBrain</span>
          </Link>

          <div className="relative z-10 max-w-2xl w-full flex-1 flex flex-col justify-center gap-8 my-8">
            <div className="space-y-4">
              <div className="inline-block px-3 py-1 bg-[#18181B] border border-[#27272A] rounded-full text-[10px] text-[#00f0ff] font-semibold tracking-widest uppercase mb-4">
                {t('auth.enterpriseGrade')}
              </div>
              <h2 className="text-4xl font-bold text-white leading-tight font-space-grotesk">
                ISO, Without the confusion.
              </h2>
              <p className="text-[#A1A1AA] text-lg leading-relaxed mt-4">
                ISO standards are powerful. But working with them rarely feels that way. Most professionals don't struggle because they lack ability. They struggle because the standards are dense, fragmented, and difficult to apply in real-world situations. ISOBrain was built to change that.
              </p>
            </div>
            <AISimulation
              customQuery="Create a new workspace for my organization on ISOBrain."
              customResponse={`For years, ISO has lived in documents, spreadsheets, and disconnected systems. You read the standard. Interpret it yourself. Apply it as best you can. Then hope it holds up under audit. It's slow. It's unclear. And it leaves too much room for doubt. ISOBrain changes how you work with ISO. Instead of digging through documentation or relying on static training, you get a system that shows you exactly where you stand, what's missing, and how to move forward. It connects learning, assessment, and real-world application into one place. So you're not just learning the standard. You're working with it.`}
            />

            <div className="mt-4 p-6 bg-[#18181B]/40 backdrop-blur-xl border border-white/5 rounded-2xl">
              <div className="flex gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <svg key={i} className="w-4 h-4 text-[#00f0ff] fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-white font-medium italic">
                {t('auth.sarahJenkinsTestimonial')}
              </p>
              <p className="text-[#A1A1AA] text-sm mt-2">{t('auth.sarahJenkinsTitle')}</p>
            </div>
          </div>

          <div className="relative z-10 text-[10px] text-[#A1A1AA] flex gap-6">
            <span>{t('dynamic.dyn_copy2024ISOBRAINAI_548')}</span>
            <Link href="/privacy" className="hover:text-white transition-colors">{t('auth.privacyPolicy')}</Link>
            <Link href="/terms" className="hover:text-white transition-colors">{t('auth.termsOfService')}</Link>
          </div>
        </div>

        {/* Right Side: The Gateway */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
          <div className="w-full max-w-[440px] z-10">
            <div className="mb-10 text-center lg:text-left">
              <h2 className="text-2xl sm:text-4xl font-bold text-white mb-2 font-space-grotesk tracking-tight whitespace-nowrap sm:whitespace-normal">
                {t('auth.createAccountTitle')}
              </h2>
              {/* <p className="text-[#A1A1AA] text-sm sm:text-base">{t('auth.freeTrial')}</p> */}
            </div>

            <div className="bg-[#18181B] border border-[#27272A] p-8 rounded-3xl shadow-2xl space-y-6">
              {/* SSO Section */}
              <div className="grid grid-cols-1 gap-3">
                <GoogleLoginButton shortText />
                {/* <FacebookLoginButton shortText />
                <div className="col-span-2 flex justify-center">
                  <div className="w-[calc(50%-6px)]">
                    <LinkedInLoginButton shortText />
                  </div>
                </div> */}
              </div>

              <div className="flex items-center gap-4 py-2">
                <div className="h-[1px] flex-1 bg-[#27272A]"></div>
                <span className="text-[#71717A] text-xs font-medium uppercase tracking-widest">{t('auth.or')}</span>
                <div className="h-[1px] flex-1 bg-[#27272A]"></div>
              </div>

              {/* Form Section */}
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-[#A1A1AA] text-xs uppercase tracking-wider font-semibold">
                          {t('auth.workEmailAddress')}
                        </FormLabel>
                        <FormControl>
                          <div className="relative group">
                            <Input
                              placeholder={t('auth.workEmailAddress')}
                              className="bg-[#121212] border-[#27272A] text-white py-6 px-4 rounded-xl focus:border-brand-cyan focus:ring-1 focus:ring-[#D4AF37]/25 transition-all text-base placeholder:text-[#52525B]"
                              {...field}
                            />
                            {isEmailValid && (
                              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-cyan animate-in zoom-in duration-300">
                                <CheckCircle2 className="w-5 h-5" />
                              </div>
                            )}
                          </div>
                        </FormControl>
                        <FormMessage className="text-[#EA4335] text-xs" />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-6 rounded-xl font-bold tracking-wide transition-all duration-300 flex items-center justify-center gap-2 bg-[#00f0ff] text-[#0F111A] hover:bg-[#00f0ff] disabled:opacity-50 cursor-pointer"
                  >
                    {isLoading ? (
                      t('auth.authenticating')
                    ) : (
                      <>
                        {isEnterprise ? t('auth.continueEnterpriseSSO') : t('auth.createAccount')}
                        {!isEnterprise && <ArrowRight className="w-4 h-4" />}
                      </>
                    )}
                  </Button>
                </form>
              </Form>

              <div className="text-center">
                <p className="text-xs sm:text-sm text-[#A1A1AA] flex items-center justify-center gap-1 flex-wrap">
                  <span className="whitespace-nowrap">{t('auth.alreadyHaveAccount')}</span>
                  <Link
                    href="/auth/login"
                    className="text-white hover:text-[#FFFFFF] font-semibold transition-colors whitespace-nowrap"
                  >
                    {t('auth.logIn')}
                  </Link>
                </p>
              </div>
            </div>

            {/* Mobile Footer (Hidden on Desktop) */}
            <div className="mt-8 text-center text-[10px] text-[#52525B] lg:hidden space-y-2">
              <p>{t('dynamic.dyn_copy2024ISOBRAINAI_548')}</p>
              <div className="flex justify-center gap-4">
                <Link href="#" className="hover:text-white transition-colors">{t('auth.privacyPolicy')}</Link>
                <Link href="#" className="hover:text-white transition-colors">{t('auth.termsOfService')}</Link>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative background blur objects */}
        <div className="fixed top-0 right-0 w-[500px] h-[500px]bg-[#00f0ff] text-[#0F111A]/5 blur-[120px] -z-0 pointer-events-none" />
        <div className="fixed bottom-0 left-1/2 w-[600px] h-[600px]bg-[#00f0ff] text-[#0F111A]/5 blur-[120px] -z-0 pointer-events-none" />
      </div>
    </div>
  );
};

export default SignUpPage;
