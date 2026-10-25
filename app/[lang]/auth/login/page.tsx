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
import { ArrowRight, CheckCircle2, Eye, EyeOff, Lock, Sparkles } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
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
import AISimulation from "@/components/landing-page-components/AISimulation";

const ease = [0.22, 1, 0.36, 1] as const;

const loginSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid work email address.",
  }),
  password: z.string().min(1, "Password is required"),
});

const inputClassName =
  "h-12 bg-[var(--ib-bg)] border-[var(--ib-line)] text-[var(--ib-ink)] px-4 rounded-[12px] focus-visible:border-[var(--ib-acc)] focus-visible:ring-4 focus-visible:ring-[color-mix(in_srgb,var(--ib-acc)_16%,transparent)] transition-[border-color,box-shadow,background-color] duration-200 text-base placeholder:text-[var(--ib-mute)] hover:border-[color-mix(in_srgb,var(--ib-acc)_28%,var(--ib-line))]";

export default function LoginPage() {
  const { t } = useTranslation();
  const { lang } = useParams();
  const searchParams = useSearchParams();
  const courseId = searchParams.get("courseId");
  const redirectParam = searchParams.get("redirect");
  const fromParam = searchParams.get("from");
  const router = useRouter();
  const dispatch = useDispatch();
  const reduceMotion = useReducedMotion();

  const [login, { isLoading }] = useLoginMutation();
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [isEnterprise, setIsEnterprise] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
      const enterpriseDomains = [
        "microsoft.com",
        "google.com",
        "apple.com",
        "meta.com",
        "amazon.com",
        "slack.com",
      ];
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
    if (!decodedTarget.startsWith("/") || decodedTarget.startsWith("//"))
      return null;
    return decodedTarget;
  };

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    try {
      const response = await login(values).unwrap();
      const accessToken =
        response?.data?.accessToken ||
        response?.accessToken ||
        response?.data?.token ||
        response?.token;
      const refreshToken =
        response?.data?.refreshToken || response?.refreshToken;

      if (accessToken) {
        document.cookie = `token=${accessToken}; path=/; max-age=31536000`;
        if (refreshToken) {
          document.cookie = `refreshToken=${refreshToken}; path=/; max-age=31536000`;
        }

        const userData =
          response.user || response?.data?.user || response?.data || response;
        const formattedUser =
          userData && (userData.id || userData._id || userData.userId)
            ? {
                id: userData.id || userData._id || userData.userId,
                email: userData.email || values.email,
                name:
                  userData.name ||
                  userData.fullName ||
                  userData.username ||
                  "",
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
        router.push(
          `/${lang}/academy${courseId ? `?courseId=${courseId}` : ""}`
        );
        toast.success(t("auth.loginSuccess", "Login successful!"));
      }
    } catch (err: any) {
      console.error("Login failed:", err);
      toast.error(
        err?.data?.message ||
          t("auth.loginError", "Login failed. Please try again.")
      );
    }
  };

  const fade = (delay = 0) =>
    reduceMotion
      ? {
          initial: false as const,
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0 },
        }
      : {
          initial: { opacity: 0, y: 16 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.5, delay, ease },
        };

  return (
    <div className="relative min-h-screen overflow-x-clip bg-[var(--ib-bg)] text-[var(--ib-ink)]">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -right-[10%] top-[-8%] h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--ib-acc)_14%,transparent),transparent_68%)] blur-2xl motion-safe:animate-[hero-glow_12s_ease-in-out_infinite_alternate]" />
        <div className="absolute -left-[8%] bottom-[-10%] h-[380px] w-[380px] rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--ib-acc)_10%,transparent),transparent_70%)] blur-2xl motion-safe:animate-[hero-glow_14s_ease-in-out_infinite_alternate] motion-safe:[animation-delay:1s]" />
        <div
          className="absolute inset-0 opacity-[0.28]"
          style={{
            backgroundImage:
              "linear-gradient(var(--ib-line) 1px, transparent 1px), linear-gradient(90deg, var(--ib-line) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            maskImage:
              "radial-gradient(ellipse 70% 55% at 35% 40%, black 12%, transparent 72%)",
          }}
        />
      </div>

      <div className="relative z-[1] mx-auto flex min-h-screen max-w-[1280px] font-sans selection:bg-[var(--ib-accbg)]">
        {/* Left — branding */}
        <div className="relative hidden w-[58%] flex-col justify-between overflow-hidden p-10 xl:p-12 lg:flex">
          <motion.div {...fade(0)}>
            <Link
              href={`/${lang}`}
              className="relative z-10 inline-flex items-center gap-3 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ib-acc)]"
            >
              <div className="flex size-10 items-center justify-center rounded-xl border border-[var(--ib-line)] bg-[var(--ib-card)] p-2 shadow-sm">
                <Image
                  src="/Icon.png"
                  alt={t("dynamic.dyn_icon_6")}
                  width={24}
                  height={24}
                />
              </div>
              <span className="text-xl font-bold tracking-tight text-[var(--ib-ink)]">
                ISOBrain
              </span>
            </Link>
          </motion.div>

          <div className="relative z-10 my-8 flex w-full max-w-2xl flex-1 flex-col justify-center gap-8">
            <motion.div {...fade(0.08)} className="space-y-4">
              <span className="ib-pill border border-[color-mix(in_srgb,var(--ib-acc)_22%,var(--ib-line))]">
                <Sparkles className="size-3.5 shrink-0" aria-hidden />
                {t("auth.intelligenceFirst")}
              </span>
              <h1 className="mb-0! text-[36px] font-bold leading-[1.12] tracking-[-0.035em] text-[var(--ib-ink)] xl:text-[42px]">
                ISO, Without the confusion.
              </h1>
              <p className="mt-4 max-w-[540px] text-[17px] leading-relaxed text-[var(--ib-mute)]">
                ISO standards are powerful. But working with them rarely feels
                that way. Most professionals don&apos;t struggle because they
                lack ability. They struggle because the standards are dense,
                fragmented, and difficult to apply in real-world situations.
                ISOBrain was built to change that.
              </p>
            </motion.div>

            <motion.div
              {...fade(0.16)}
              className="relative overflow-hidden rounded-2xl shadow-[0_24px_60px_-28px_rgba(11,18,32,0.28)] ring-1 ring-[color-mix(in_srgb,var(--ib-acc)_12%,transparent)]"
            >
              <div
                aria-hidden
                className="pointer-events-none absolute -inset-4 -z-10 rounded-[28px] bg-[radial-gradient(ellipse_at_30%_20%,color-mix(in_srgb,var(--ib-acc)_16%,transparent),transparent_58%)]"
              />
              <AISimulation
                customQuery="Initialize secure authentication sequence for my ISOBrain account."
                customResponse={`For years, ISO has lived in documents, spreadsheets, and disconnected systems. You read the standard. Interpret it yourself. Apply it as best you can. Then hope it holds up under audit. It's slow. It's unclear. And it leaves too much room for doubt. ISOBrain changes how you work with ISO. Instead of digging through documentation or relying on static training, you get a system that shows you exactly where you stand, what's missing, and how to move forward. It connects learning, assessment, and real-world application into one place. So you're not just learning the standard. You're working with it.`}
              />
            </motion.div>
          </div>

          <motion.div
            {...fade(0.22)}
            className="relative z-10 flex flex-wrap gap-6 text-[11px] text-[var(--ib-mute)]"
          >
            <span>{t("dynamic.dyn_copy2026ISOBRAINAI_546")}</span>
            <Link
              href="#"
              className="transition-colors hover:text-[var(--ib-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ib-acc)]"
            >
              {t("auth.privacyPolicy")}
            </Link>
            <Link
              href="#"
              className="transition-colors hover:text-[var(--ib-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ib-acc)]"
            >
              {t("auth.termsOfService")}
            </Link>
          </motion.div>
        </div>

        {/* Right — form */}
        <div className="relative flex w-full items-center justify-center px-5 py-10 sm:px-8 sm:py-12 lg:w-[42%] lg:px-10">
          <div className="w-full max-w-[420px] z-10">
            {/* Mobile logo */}
            <motion.div {...fade(0)} className="mb-8 flex justify-center lg:hidden">
              <Link
                href={`/${lang}`}
                className="inline-flex items-center gap-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ib-acc)]"
              >
                <div className="flex size-10 items-center justify-center rounded-xl border border-[var(--ib-line)] bg-[var(--ib-card)] p-2 shadow-sm">
                  <Image
                    src="/Icon.png"
                    alt={t("dynamic.dyn_icon_6")}
                    width={24}
                    height={24}
                  />
                </div>
                <span className="text-xl font-bold text-[var(--ib-ink)]">
                  ISOBrain
                </span>
              </Link>
            </motion.div>

            <motion.div
              {...fade(0.06)}
              className="mb-8 text-center lg:text-left"
            >
              <h2 className="mb-0! text-[28px] font-bold tracking-tight text-[var(--ib-ink)] sm:text-[34px]">
                {t("auth.loginWelcomeBack")}
              </h2>
              <p className="mt-2 text-sm text-[var(--ib-mute)] sm:text-base">
                {t("auth.loginEnterDetails")}
              </p>
            </motion.div>

            <motion.div
              {...fade(0.12)}
              className="ib-card space-y-6 p-6 shadow-[0_20px_48px_-28px_rgba(11,18,32,0.22)] sm:p-8"
            >
              <div className="grid grid-cols-1 gap-3">
                <GoogleLoginButton shortText />
              </div>

              <div className="flex items-center gap-4 py-0.5">
                <div className="h-px flex-1 bg-[var(--ib-line)]" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--ib-mute)]">
                  {t("auth.or")}
                </span>
                <div className="h-px flex-1 bg-[var(--ib-line)]" />
              </div>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-5"
                  noValidate
                >
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-[12px] font-semibold uppercase tracking-[0.06em] text-[var(--ib-mute)]">
                          {t("auth.emailAddress")}
                        </FormLabel>
                        <FormControl>
                          <div className="relative group">
                            <Input
                              type="email"
                              autoComplete="email"
                              inputMode="email"
                              placeholder={t("auth.workEmailAddress")}
                              className={`${inputClassName} pr-11`}
                              aria-invalid={!!form.formState.errors.email}
                              {...field}
                            />
                            {isEmailValid && (
                              <div
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--ib-ok)]"
                                aria-hidden
                              >
                                <CheckCircle2 className="size-5" />
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
                        <FormItem className="space-y-2">
                          <div className="flex items-center justify-between gap-3">
                            <FormLabel className="text-[12px] font-semibold uppercase tracking-[0.06em] text-[var(--ib-mute)]">
                              {t("auth.password")}
                            </FormLabel>
                            <Link
                              href="#"
                              className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--ib-mute)] transition-colors hover:text-[var(--ib-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ib-acc)]"
                            >
                              {t("auth.forgotPassword")}
                            </Link>
                          </div>
                          <FormControl>
                            <div className="relative group">
                              <Input
                                type={showPassword ? "text" : "password"}
                                autoComplete="current-password"
                                placeholder="••••••••"
                                className={`${inputClassName} pr-20`}
                                aria-invalid={!!form.formState.errors.password}
                                {...field}
                              />
                              <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-0.5">
                                <span
                                  className="flex size-8 items-center justify-center text-[var(--ib-mute)]"
                                  aria-hidden
                                >
                                  <Lock className="size-3.5" />
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setShowPassword((v) => !v)}
                                  className="flex size-8 items-center justify-center rounded-lg text-[var(--ib-mute)] transition-colors hover:bg-[var(--ib-accbg)] hover:text-[var(--ib-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ib-acc)]"
                                  aria-label={
                                    showPassword
                                      ? "Hide password"
                                      : "Show password"
                                  }
                                  aria-pressed={showPassword}
                                >
                                  {showPassword ? (
                                    <EyeOff className="size-4" />
                                  ) : (
                                    <Eye className="size-4" />
                                  )}
                                </button>
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
                    aria-busy={isLoading}
                    className="h-12 w-full cursor-pointer rounded-[12px] bg-[var(--ib-acc)] text-[15px] font-semibold tracking-wide text-white shadow-[0_12px_28px_-10px_color-mix(in_srgb,var(--ib-acc)_55%,transparent)] transition-[transform,box-shadow,opacity,background-color] duration-200 hover:-translate-y-0.5 hover:bg-[var(--ib-acc)]/90 hover:shadow-[0_16px_36px_-10px_color-mix(in_srgb,var(--ib-acc)_65%,transparent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ib-acc)] disabled:pointer-events-none disabled:opacity-50 disabled:hover:translate-y-0"
                  >
                    {isLoading ? (
                      t("auth.signingIn")
                    ) : (
                      <span className="inline-flex items-center justify-center gap-2">
                        {isEnterprise
                          ? t("auth.loginWithMicrosoft")
                          : t("auth.signIn")}
                        {!isEnterprise && (
                          <ArrowRight className="size-4" aria-hidden />
                        )}
                      </span>
                    )}
                  </Button>
                </form>
              </Form>

              <div className="text-center">
                <p className="flex flex-wrap items-center justify-center gap-1 text-xs text-[var(--ib-mute)] sm:text-sm">
                  <span className="whitespace-nowrap">
                    {t("auth.newToIsobrain")}
                  </span>
                  <Link
                    href="/auth/sign-up"
                    className="whitespace-nowrap font-semibold text-[var(--ib-acc)] transition-colors hover:text-[var(--ib-acc)]/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ib-acc)]"
                  >
                    {t("auth.createAccount")}
                  </Link>
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
