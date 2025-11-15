"use client"

import DashboardLayout from "@/components/dashboard-layout"
import { useLanguage } from "@/components/language-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function NoteHonorairesPage() {
  const { t, language } = useLanguage()

  // Translations for this page
  const translations = {
    title: {
      fr: "Note Honoraires",
      en: "Fee Notes",
      ar: "ملاحظات الرسوم",
    },
    comingSoon: {
      fr: "Fonctionnalité à venir",
      en: "Feature coming soon",
      ar: "الميزة قادمة قريبا",
    },
  }

  const t_local = (key: string) => {
    return translations[key as keyof typeof translations]?.[language] || key
  }

  return (
    <DashboardLayout>
      <Card>
        <CardHeader>
          <CardTitle>{t_local("title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center py-10 text-muted-foreground">{t_local("comingSoon")}</p>
        </CardContent>
      </Card>
    </DashboardLayout>
  )
}
