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
import AISimulation from "@/components/landing-page-components/AISimulation";

const ease = [0.22, 1, 0.36, 1] as const;

const loginSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(1, "Password is required"),
});

const AUTH_REVIEWS = [
  {
    quote:
      "ISOBrain transformed our audit process from weeks to hours.",
    author: "Sarah Jenkins",
    role: "Head of Compliance at Vercel",
  },
  {
    quote:
      "Finally a platform that connects learning, assessment, and real ISO application.",
    author: "Marcus Chen",
    role: "Lead Auditor, Quality Systems",
  },
  {
    quote:
      "Our team stopped guessing at clauses and started working with clear next steps.",
    author: "Priya Nair",
    role: "ISO Program Manager",
  },
];

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
          <motion.div {...fade(0)} className="relative z-10 flex w-full justify-center">
            <Link
              href={`/${lang}`}
              className="inline-flex items-center overflow-hidden rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ib-acc)]"
            >
              <Image
                src="/isobrain-logo.png"
                alt="ISOBrain.AI"
                width={180}
                height={180}
                className="h-auto w-[140px] object-contain sm:w-[160px]"
                priority
              />
            </Link>
          </motion.div>

          <div className="relative z-10 my-8 flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-8 text-center">
            <motion.div {...fade(0.08)} className="mx-auto space-y-4">
              <span className="ib-pill mx-auto border border-[color-mix(in_srgb,var(--ib-acc)_22%,var(--ib-line))]">
                <Sparkles className="size-3.5 shrink-0" aria-hidden />
                {t("auth.intelligenceFirst")}
              </span>
              <h1 className="mb-0! text-[36px] font-bold leading-[1.12] tracking-[-0.035em] text-[var(--ib-ink)] xl:text-[42px]">
                See where you stand. Close the gaps. Apply the standard.
              </h1>
              <p className="mx-auto mt-4 max-w-[540px] text-[17px] leading-relaxed text-[var(--ib-mute)]">
                ISO standards are dense and hard to apply in real work. ISOBrain
                connects assessment, learning, and AI guidance so you know what
                to fix next—and how to prove it.
              </p>
            </motion.div>

            <motion.div
              {...fade(0.16)}
              className="relative w-full overflow-hidden rounded-2xl text-left shadow-[0_24px_60px_-28px_rgba(11,18,32,0.28)] ring-1 ring-[color-mix(in_srgb,var(--ib-acc)_12%,transparent)]"
            >
              <div
                aria-hidden
                className="pointer-events-none absolute -inset-4 -z-10 rounded-[28px] bg-[radial-gradient(ellipse_at_30%_20%,color-mix(in_srgb,var(--ib-acc)_16%,transparent),transparent_58%)]"
              />
              <AISimulation
                customQuery="Where should my team start with ISO compliance?"
                customResponse={`Start with a clear view of your gaps. ISOBrain assesses your knowledge, maps the standards that matter for your role, and turns dense clauses into practical next steps—so you learn what you need and apply it with confidence.`}
              />
            </motion.div>

            <motion.div
              {...fade(0.2)}
              className="grid w-full gap-3 sm:grid-cols-3"
            >
              {AUTH_REVIEWS.map((review) => (
                <div key={review.author} className="ib-card p-4 text-center sm:p-5">
                  <div className="mb-2 flex justify-center gap-0.5" aria-hidden>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <svg
                        key={i}
                        className="size-3.5 fill-current text-[var(--ib-acc)]"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-[13px] font-medium italic leading-snug text-[var(--ib-ink)]">
                    “{review.quote}”
                  </p>
                  <p className="mt-2 text-[11px] font-semibold text-[var(--ib-mute)]">
                    — {review.author}
                  </p>
                  <p className="text-[10px] text-[var(--ib-mute)]">{review.role}</p>
                </div>
              ))}
            </motion.div>
          </div>

          <motion.div
            {...fade(0.22)}
            className="relative z-10 flex flex-wrap justify-center gap-6 text-[11px] text-[var(--ib-mute)]"
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
                className="inline-flex items-center overflow-hidden rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ib-acc)]"
              >
                <Image
                  src="/isobrain-logo.png"
                  alt="ISOBrain.AI"
                  width={140}
                  height={140}
                  className="h-auto w-[120px] object-contain"
                  priority
                />
              </Link>
            </motion.div>

            <motion.div
              {...fade(0.06)}
              className="mb-8 text-center"
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
                              placeholder={t("auth.emailAddress")}
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
