"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
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
import { useRegisterMutation } from "@/lib/redux/features/auth/authApi";
import GoogleLoginButton from "@/components/auth/GoogleLoginButton";
import AISimulation from "@/components/landing-page-components/AISimulation";

const ease = [0.22, 1, 0.36, 1] as const;

const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid work email address.",
  }),
});

const inputClassName =
  "h-12 bg-[var(--ib-bg)] border-[var(--ib-line)] text-[var(--ib-ink)] px-4 rounded-[12px] focus-visible:border-[var(--ib-acc)] focus-visible:ring-4 focus-visible:ring-[color-mix(in_srgb,var(--ib-acc)_16%,transparent)] transition-[border-color,box-shadow,background-color] duration-200 text-base placeholder:text-[var(--ib-mute)] hover:border-[color-mix(in_srgb,var(--ib-acc)_28%,var(--ib-line))]";

const SignUpPage = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { lang } = useParams();
  const reduceMotion = useReducedMotion();
  const [register, { isLoading }] = useRegisterMutation();
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

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await register({ email: values.email }).unwrap();
      router.push(`/auth/otp?email=${encodeURIComponent(values.email)}`);
    } catch (err: any) {
      console.error("Failed to register email:", err);
      toast.error(
        err?.data?.message ||
          t("auth.signupError", "Failed to register. Please try again.")
      );
    }
  }

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
                {t("auth.enterpriseGrade")}
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
              {...fade(0.14)}
              className="relative overflow-hidden rounded-2xl shadow-[0_24px_60px_-28px_rgba(11,18,32,0.28)] ring-1 ring-[color-mix(in_srgb,var(--ib-acc)_12%,transparent)]"
            >
              <div
                aria-hidden
                className="pointer-events-none absolute -inset-4 -z-10 rounded-[28px] bg-[radial-gradient(ellipse_at_30%_20%,color-mix(in_srgb,var(--ib-acc)_16%,transparent),transparent_58%)]"
              />
              <AISimulation
                customQuery="Create a new workspace for my organization on ISOBrain."
                customResponse={`For years, ISO has lived in documents, spreadsheets, and disconnected systems. You read the standard. Interpret it yourself. Apply it as best you can. Then hope it holds up under audit. It's slow. It's unclear. And it leaves too much room for doubt. ISOBrain changes how you work with ISO. Instead of digging through documentation or relying on static training, you get a system that shows you exactly where you stand, what's missing, and how to move forward. It connects learning, assessment, and real-world application into one place. So you're not just learning the standard. You're working with it.`}
              />
            </motion.div>

            <motion.div
              {...fade(0.2)}
              className="ib-card p-5 sm:p-6"
            >
              <div className="mb-3 flex gap-1" aria-hidden>
                {[1, 2, 3, 4, 5].map((i) => (
                  <svg
                    key={i}
                    className="size-4 fill-current text-[var(--ib-acc)]"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="font-medium italic text-[var(--ib-ink)]">
                {t("auth.sarahJenkinsTestimonial")}
              </p>
              <p className="mt-2 text-sm text-[var(--ib-mute)]">
                {t("auth.sarahJenkinsTitle")}
              </p>
            </motion.div>
          </div>

          <motion.div
            {...fade(0.24)}
            className="relative z-10 flex flex-wrap gap-6 text-[11px] text-[var(--ib-mute)]"
          >
            <span>{t("dynamic.dyn_copy2024ISOBRAINAI_548")}</span>
            <Link
              href="/privacy"
              className="transition-colors hover:text-[var(--ib-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ib-acc)]"
            >
              {t("auth.privacyPolicy")}
            </Link>
            <Link
              href="/terms"
              className="transition-colors hover:text-[var(--ib-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ib-acc)]"
            >
              {t("auth.termsOfService")}
            </Link>
          </motion.div>
        </div>

        {/* Right — form */}
        <div className="relative flex w-full items-center justify-center px-5 py-10 sm:px-8 sm:py-12 lg:w-[42%] lg:px-10">
          <div className="z-10 w-full max-w-[420px]">
            <motion.div
              {...fade(0)}
              className="mb-8 flex justify-center lg:hidden"
            >
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
                {t("auth.createAccountTitle")}
              </h2>
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
                          {t("auth.workEmailAddress")}
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

                  <Button
                    type="submit"
                    disabled={isLoading || !isEmailValid}
                    aria-busy={isLoading}
                    className="h-12 w-full cursor-pointer rounded-[12px] bg-[var(--ib-acc)] text-[15px] font-semibold tracking-wide text-white shadow-[0_12px_28px_-10px_color-mix(in_srgb,var(--ib-acc)_55%,transparent)] transition-[transform,box-shadow,opacity,background-color] duration-200 hover:-translate-y-0.5 hover:bg-[var(--ib-acc)]/90 hover:shadow-[0_16px_36px_-10px_color-mix(in_srgb,var(--ib-acc)_65%,transparent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ib-acc)] disabled:pointer-events-none disabled:opacity-50 disabled:hover:translate-y-0"
                  >
                    {isLoading ? (
                      t("auth.authenticating")
                    ) : (
                      <span className="inline-flex items-center justify-center gap-2">
                        {isEnterprise
                          ? t("auth.continueEnterpriseSSO")
                          : t("auth.createAccount")}
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
                    {t("auth.alreadyHaveAccount")}
                  </span>
                  <Link
                    href="/auth/login"
                    className="whitespace-nowrap font-semibold text-[var(--ib-acc)] transition-colors hover:text-[var(--ib-acc)]/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ib-acc)]"
                  >
                    {t("auth.logIn")}
                  </Link>
                </p>
              </div>
            </motion.div>

            <motion.div
              {...fade(0.18)}
              className="mt-8 space-y-2 text-center text-[10px] text-[var(--ib-mute)] lg:hidden"
            >
              <p>{t("dynamic.dyn_copy2024ISOBRAINAI_548")}</p>
              <div className="flex justify-center gap-4">
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
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
