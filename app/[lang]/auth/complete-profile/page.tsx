"use client";

import { Suspense } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, User as UserIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { useDispatch } from "react-redux";
import { setCredentials } from "@/lib/redux/features/auth/authSlice";
import { useCompleteProfileMutation, useLoginMutation } from "@/lib/redux/features/auth/authApi";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import "@/lib/i18n/client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import Image from "next/image";

const formSchema = z.object({
  firstName: z.string().min(2, { message: "First name must be at least 2 characters." }),
  lastName: z.string().min(2, { message: "Last name must be at least 2 characters." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

const CompleteProfileContent = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { lang } = useParams();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const dispatch = useDispatch();

  const [completeProfile, { isLoading: isProfileLoading, isError: isProfileError }] = useCompleteProfileMutation();
  const [login, { isLoading: isLoginLoading, isError: isLoginError }] = useLoginMutation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      // 1. Submit Profile API call
      await completeProfile({
        firstName: values.firstName,
        lastName: values.lastName,
        password: values.password,
      }).unwrap();

      // 2. Auto Login to get tokens if email exists
      if (email) {
        const loginRes = await login({ email, password: values.password }).unwrap();
        const accessToken = loginRes?.accessToken || loginRes?.token || loginRes?.data?.accessToken;
        const refreshToken = loginRes?.refreshToken || loginRes?.data?.refreshToken;

        if (accessToken) {
          // Set cookies
          document.cookie = `token=${accessToken}; path=/; max-age=31536000`;
          if (refreshToken) {
            document.cookie = `refreshToken=${refreshToken}; path=/; max-age=31536000`;
          }
          // Connect to Redux global state
          const userData = loginRes?.user || loginRes?.data?.user;
          if (userData) {
            dispatch(
              setCredentials({
                user: {
                  id: userData.id || userData._id,
                  email: userData.email || email,
                  name: userData.name || `${values.firstName} ${values.lastName}`,
                  role: userData.role,
                  purchasedPlanIds: []
                },
                token: accessToken,
                refreshToken: refreshToken || null,
              })
            );
          }
        }
      }

      // 3. Navigate to pricing/payment route
      router.push(`/${lang}/auth/login`);
    } catch (err: any) {
      console.error("Failed complete profile setup or login:", err);
      toast.error(err?.data?.message || t('auth.profileError', 'There was an error updating your profile.'));
    }
  }

  const isLoading = isProfileLoading || isLoginLoading;
  const isError = isProfileError || isLoginError;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--ib-bg)] p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo Section */}
        <div className="flex justify-center items-center gap-2 mb-8">
          <div className="bg-[var(--ib-card)] border border-[var(--ib-line)] h-10 w-10 rounded-[10px] flex items-center justify-center">
            <div className="relative w-8 h-8">
              <Image
                src="/Icon.png"
                alt={t('dynamic.dyn_icon_6')}
                fill
                className="object-contain"
              />
            </div>
          </div>
          <span className="font-bold text-[var(--ib-ink)] text-2xl">ISOBrain.ai</span>
        </div>

        <Card className="border border-[var(--ib-line)] bg-[var(--ib-card)] shadow-sm rounded-2xl">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-3xl font-bold text-[var(--ib-ink)]">
              {t('auth.completeProfileTitle')}
            </CardTitle>
            <CardDescription className="text-[var(--ib-mute)]">
              {t('auth.completeProfileSubtitle')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 mb-4">

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[var(--ib-ink)] font-semibold">{t('auth.firstName')}</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <UserIcon className="absolute left-4 top-4.5 h-4 w-4 text-[var(--ib-mute)]" />
                            <Input
                              placeholder={t('auth.firstName')}
                              className="pl-10 py-6 bg-[var(--ib-bg)] border-[var(--ib-line)] text-[var(--ib-ink)] rounded-[10px]"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[var(--ib-ink)] font-semibold">{t('auth.lastName')}</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <UserIcon className="absolute left-4 top-4.5 h-4 w-4 text-[var(--ib-mute)]" />
                            <Input
                              placeholder={t('auth.lastName')}
                              className="pl-10 py-6 bg-[var(--ib-bg)] border-[var(--ib-line)] text-[var(--ib-ink)] rounded-[10px]"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[var(--ib-ink)] font-semibold">{t('auth.password')}</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-4 top-4.5 h-4 w-4 text-[var(--ib-mute)]" />
                          <Input
                            type="password"
                            placeholder={t('auth.createPassword')}
                            className="pl-10 py-6 bg-[var(--ib-bg)] border-[var(--ib-line)] text-[var(--ib-ink)] rounded-[10px]"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {isError && (
                  <div className="text-red-500 text-sm font-medium text-center bg-red-50 p-3 rounded-[10px]">
                    {t('auth.profileError')}
                  </div>
                )}

                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 text-md rounded-[10px] bg-[var(--ib-acc)] hover:bg-[var(--ib-acc)]/90 text-white font-semibold disabled:opacity-75"
                  >
                    {isLoading ? t('auth.settingUp') : t('auth.completeSetup')}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Footer Text */}
        <div className="text-center text-xs text-[var(--ib-mute)] mt-6">
          <p>
            {t('auth.byContinuing')}{" "}
            <Link href="#" className="text-[var(--ib-acc)] hover:underline">{t('footer.terms')}</Link>{" "}
            {t('auth.and')}{" "}
            <Link href="#" className="text-[var(--ib-acc)] hover:underline">{t('footer.privacy')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

const CompleteProfilePage = () => {
  const { t } = useTranslation();
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[var(--ib-bg)] flex justify-center items-center">
        <div className="text-[var(--ib-mute)] font-medium tracking-wide">{t('auth.loadingProfile')}</div>
      </div>
    }>
      <CompleteProfileContent />
    </Suspense>
  );
};

export default CompleteProfilePage;
