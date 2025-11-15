"use client"

import { useRouter } from "next/navigation"
import { useLanguage } from "@/components/language-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ShieldAlert } from "lucide-react"

export default function AccessDenied() {
  const router = useRouter()
  const { t, language } = useLanguage()

  // Translations for this component
  const translations = {
    title: {
      fr: "Accès Refusé",
      en: "Access Denied",
      ar: "تم رفض الوصول",
    },
    message: {
      fr: "Vous n'avez pas les autorisations nécessaires pour accéder à cette page.",
      en: "You do not have the necessary permissions to access this page.",
      ar: "ليس لديك الأذونات اللازمة للوصول إلى هذه الصفحة.",
    },
    backButton: {
      fr: "Retour à la page d'accueil",
      en: "Back to home page",
      ar: "العودة إلى الصفحة الرئيسية",
    },
  }

  const t_local = (key: string) => {
    return translations[key as keyof typeof translations]?.[language as "fr" | "en" | "ar"] || key
  }

  const handleBackToHome = () => {
    // Redirect based on user role (this would be handled by middleware)
    router.push("/")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader className="bg-red-50 border-b border-red-100">
          <CardTitle className="flex items-center text-red-700">
            <ShieldAlert className="h-6 w-6 mr-2" />
            {t_local("title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="text-gray-700 mb-6">{t_local("message")}</p>
          <Button onClick={handleBackToHome} className="w-full bg-[#2E8BC0] hover:bg-[#1F3B4D]">
            {t_local("backButton")}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
