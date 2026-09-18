import I18nProvider from "@/components/I18nProvider";

export default function LangLayout({ children }: { children: React.ReactNode }) {
  return <I18nProvider>{children}</I18nProvider>;
}
