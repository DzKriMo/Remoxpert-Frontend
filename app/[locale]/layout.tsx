import type React from "react"
import { LanguageProvider } from "@/components/language-provider"

export async function generateStaticParams() {
  return [{ locale: "fr" }, { locale: "en" }, { locale: "ar" }]
}

export default function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  return <LanguageProvider initialLanguage={params.locale as "fr" | "en" | "ar"}>{children}</LanguageProvider>
}
