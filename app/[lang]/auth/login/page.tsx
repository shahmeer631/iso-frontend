"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useDispatch } from "react-redux";
import { useLoginMutation } from "@/lib/redux/features/auth/authApi";
import { setCredentials } from "@/lib/redux/features/auth/authSlice";
import Image from "next/image";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { ArrowRight, CheckCircle2, Lock } from "lucide-react";
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
import GoogleLoginButton from "@/components/auth/GoogleLoginButton";
import FacebookLoginButton from "@/components/auth/FacebookLoginButton";
import LinkedInLoginButton from "@/components/auth/LinkedInLoginButton";
import AISimulation from "@/components/landing-page-components/AISimulation";

const loginSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid work email address.",
  }),
  password: z.string().min(1, "Password is required"),
});

export default function LoginPage() {
  const { t } = useTranslation();
  const { lang } = useParams();
  const searchParams = useSearchParams();
  const courseId = searchParams.get("courseId");
  const redirectParam = searchParams.get("redirect");
  const fromParam = searchParams.get("from");
  const router = useRouter();
  const dispatch = useDispatch();

  const [login, { isLoading, isError }] = useLoginMutation();
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [isEnterprise, setIsEnterprise] = useState(false);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const emailValue = form.watch("email");

  useEffect(() => {
    const isValid = z.string().email().safeParse(emailValue).success;
    setIsEmailValid(isValid);

    if (isValid) {
      const enterpriseDomains = ["microsoft.com", "google.com", "apple.com", "meta.com", "amazon.com", "slack.com"];
      const domain = emailValue.split("@")[1]?.toLowerCase();
      setIsEnterprise(enterpriseDomains.includes(domain));
    } else {
      setIsEnterprise(false);
    }
  }, [emailValue]);

  const resolveSafeRedirect = () => {
    const rawTarget = redirectParam || fromParam;
    if (!rawTarget) return null;
    let decodedTarget = rawTarget;
    try {
      decodedTarget = decodeURIComponent(rawTarget);
    } catch {
      return null;
    }
    if (!decodedTarget.startsWith("/") || decodedTarget.startsWith("//")) return null;
    return decodedTarget;
  };

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    try {
      const response = await login(values).unwrap();
      const accessToken = response?.data?.accessToken || response?.accessToken || response?.data?.token || response?.token;
      const refreshToken = response?.data?.refreshToken || response?.refreshToken;

      if (accessToken) {
        document.cookie = `token=${accessToken}; path=/; max-age=31536000`;
        if (refreshToken) {
          document.cookie = `refreshToken=${refreshToken}; path=/; max-age=31536000`;
        }

        const userData = response.user || response?.data?.user || response?.data || response;
        const formattedUser = (userData && (userData.id || userData._id || userData.userId))
          ? {
            id: userData.id || userData._id || userData.userId,
            email: userData.email || values.email,
            name: userData.name || userData.fullName || userData.username || "",
            role: userData.role || "USER",
          }
          : null;

        dispatch(
          setCredentials({
            user: formattedUser as any,
            token: accessToken,
            refreshToken: refreshToken || null,
          })
        );

        const safeRedirect = resolveSafeRedirect();
        if (safeRedirect) {
          router.push(safeRedirect);
          return;
        }
        router.push(`/${lang}/academy${courseId ? `?courseId=${courseId}` : ""}`);
        toast.success(t('auth.loginSuccess', 'Login successful!'));
      }
    } catch (err: any) {
      console.error("Login failed:", err);
      toast.error(err?.data?.message || t('auth.loginError', 'Login failed. Please try again.'));
    }
  };

  return (

    <div className="min-h-screen bg-[#09090B]">
      <div className="container mx-auto flex min-h-screen font-sans selection:bg-brand-cyan text-[#0F111A]/30">
        {/* Left Side: The Canvas (Desktop only) */}
        <div className="hidden lg:flex w-2/3 relative overflow-hidden flex-col justify-between p-12 bg-[#09090B]">

          <Link href={`/${lang}`} className="relative z-10 flex items-center gap-3">
            <div className="w-10 h-10 bg-[#18181B] border border-[#27272A] rounded-xl flex items-center justify-center p-2 shadow-2xl">
              <Image src="/Icon.png" alt={t('dynamic.dyn_icon_6')} width={24} height={24} />
            </div>
            <span className="text-xl font-bold t text-white ">ISOBrain</span>
          </Link>

          <div className="relative z-10 max-w-2xl w-full flex-1 flex flex-col justify-center gap-8 my-8">
            <div className="space-y-4">
              <div className="inline-block px-3 py-1 bg-[#18181B] border border-[#27272A] rounded-full text-[10px] text-[#00f0ff] font-semibold tracking-widest uppercase mb-4">
                {t('auth.intelligenceFirst')}
              </div>
              <h2 className="text-4xl font-bold text-white leading-tight font-space-grotesk">
                ISO, Without the confusion.
              </h2>
              <p className="text-[#A1A1AA] text-lg leading-relaxed mt-4">
                ISO standards are powerful. But working with them rarely feels that way. Most professionals don't struggle because they lack ability. They struggle because the standards are dense, fragmented, and difficult to apply in real-world situations. ISOBrain was built to change that.
              </p>
            </div>

            <AISimulation
              customQuery="Initialize secure authentication sequence for my ISOBrain account."
              customResponse={`For years, ISO has lived in documents, spreadsheets, and disconnected systems. You read the standard. Interpret it yourself. Apply it as best you can. Then hope it holds up under audit. It's slow. It's unclear. And it leaves too much room for doubt. ISOBrain changes how you work with ISO. Instead of digging through documentation or relying on static training, you get a system that shows you exactly where you stand, what's missing, and how to move forward. It connects learning, assessment, and real-world application into one place. So you're not just learning the standard. You're working with it.`}
            />
          </div>

          <div className="relative z-10 text-[10px] text-[#A1A1AA] flex gap-6">
            <span>{t('dynamic.dyn_copy2026ISOBRAINAI_546')}</span>
            <Link href="#" className="hover:text-white transition-colors">{t('auth.privacyPolicy')}</Link>
            <Link href="#" className="hover:text-white transition-colors">{t('auth.termsOfService')}</Link>
          </div>
        </div>

        {/* Right Side: The Gateway */}
        <div className="w-full lg:w-1/3 flex items-center justify-center p-6 sm:p-12 relative">
          <div className="w-full max-w-[440px] z-10">
            <div className="mb-10 text-center lg:text-left">
              <h2 className="text-2xl sm:text-4xl font-bold text-white mb-2 font-space-grotesk tracking-tight whitespace-nowrap sm:whitespace-normal">
                {t('auth.loginWelcomeBack')}
              </h2>
              <p className="text-[#A1A1AA] text-sm sm:text-base">
                {t('auth.loginEnterDetails')}
              </p>
            </div>

            <div className="bg-[#18181B] border border-[#27272A] p-8 rounded-3xl shadow-2xl space-y-6 transition-all duration-500">
              {/* SSO Section */}
              <div className="grid grid-cols-1 gap-3">
                <GoogleLoginButton shortText />
                {/* <FacebookLoginButton shortText /> */}
                {/* <div className="col-span-2 flex justify-center">
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
                          {t('auth.emailAddress')}
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

                  {!isEnterprise && (
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                          <div className="flex items-center justify-between">
                            <FormLabel className="text-[#A1A1AA] text-xs uppercase tracking-wider font-semibold">
                              {t('auth.password')}
                            </FormLabel>
                            <Link href="#" className="text-[10px] text-[#71717A] hover:text-white transition-colors uppercase tracking-widest font-bold">{t('auth.forgotPassword')}</Link>
                          </div>
                          <FormControl>
                            <div className="relative group">
                              <Input
                                type="password"
                                placeholder="••••••••"
                                className="bg-[#121212] border-[#27272A] text-white py-6 px-4 rounded-xl focus:border-brand-cyan focus:ring-1 focus:ring-[#D4AF37]/25 transition-all text-base placeholder:text-[#52525B]"
                                {...field}
                              />
                              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#52525B]">
                                <Lock className="w-4 h-4" />
                              </div>
                            </div>
                          </FormControl>
                          <FormMessage className="text-[#EA4335] text-xs" />
                        </FormItem>
                      )}
                    />
                  )}

                  <Button
                    type="submit"
                    disabled={isLoading || !isEmailValid}
                    className="w-full py-6 rounded-xl font-bold tracking-wide transition-all duration-300 flex items-center justify-center gap-2 bg-[#00f0ff] text-[#0F111A] hover:bg-[#00f0ff] disabled:opacity-50 cursor-pointer"
                  >
                    {isLoading ? (
                      t('auth.signingIn')
                    ) : (
                      <>
                        {isEnterprise ? t('auth.loginWithMicrosoft') : t('auth.signIn')}
                        {!isEnterprise && <ArrowRight className="w-4 h-4" />}
                      </>
                    )}
                  </Button>
                </form>
              </Form>

              <div className="text-center">
                <p className="text-xs sm:text-sm text-[#A1A1AA] flex items-center justify-center gap-1 flex-wrap">
                  <span className="whitespace-nowrap">{t('auth.newToIsobrain')}</span>
                  <Link
                    href="/auth/sign-up"
                    className="text-white hover:text-[#FFFFFF] font-semibold transition-colors whitespace-nowrap"
                  >
                    {t('auth.createAccount')}
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-brand-cyan text-[#0F111A]/5 blur-[120px] -z-0 pointer-events-none" />
        <div className="fixed bottom-0 left-1/2 w-[600px] h-[600px] bg-brand-cyan text-[#0F111A]/5 blur-[120px] -z-0 pointer-events-none" />
      </div>

    </div>
  );
}
