"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import { useLanguage } from "@/components/language-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Eye } from "lucide-react"
import { getDossiers } from "@/lib/dossier-utils"

type DossierStatus = "new" | "in_progress" | "ended"

interface DossierCloture {
  id: string
  num_sinistre: string
  agence: string
  assure_nom: string
  status: DossierStatus
  created_at: string
  updated_at: string
}

export default function DossiersCloturesPage() {
  const { t, language } = useLanguage()
  const router = useRouter()
  const [dossiersClotures, setDossiersClotures] = useState<DossierCloture[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  // Fetch dossiers on component mount and filter by "ended" status
  useEffect(() => {
    const fetchDossiersClotures = async () => {
      try {
        setLoading(true)
        const response = await getDossiers()
        // Filter only dossiers with status "ended"
        const endedDossiers = (response.data || []).filter((dossier: any) => dossier.status === "ended")
        setDossiersClotures(endedDossiers)
      } catch (error) {
        console.error("Error fetching closed dossiers:", error)
        setDossiersClotures([])
      } finally {
        setLoading(false)
      }
    }

    fetchDossiersClotures()
  }, [])

  // Translations for this page
  const translations = {
    title: {
      fr: "Dossiers Clôturés",
      en: "Closed Cases",
      ar: "الملفات المغلقة",
    },
    claimNumber: {
      fr: "N° Sinistre",
      en: "Claim Number",
      ar: "رقم المطالبة",
    },
    agency: {
      fr: "Agence",
      en: "Agency",
      ar: "وكالة",
    },
    insuredName: {
      fr: "Nom de l'assuré",
      en: "Insured Name",
      ar: "اسم المؤمن عليه",
    },
    status: {
      fr: "État",
      en: "Status",
      ar: "الحالة",
    },
    createdAt: {
      fr: "Date de création",
      en: "Created Date",
      ar: "تاريخ الإنشاء",
    },
    updatedAt: {
      fr: "Date de clôture",
      en: "Closing Date",
      ar: "تاريخ الإغلاق",
    },
    actions: {
      fr: "Actions",
      en: "Actions",
      ar: "إجراءات",
    },
    ended: {
      fr: "Terminé",
      en: "Ended",
      ar: "منتهي",
    },
    search: {
      fr: "Rechercher...",
      en: "Search...",
      ar: "بحث...",
    },
    noDossiers: {
      fr: "Aucun dossier clôturé trouvé",
      en: "No closed cases found",
      ar: "لم يتم العثور على ملفات مغلقة",
    },
    loading: {
      fr: "Chargement...",
      en: "Loading...",
      ar: "جار التحميل...",
    },
    view: {
      fr: "Voir",
      en: "View",
      ar: "عرض",
    },
    details: {
      fr: "Détails",
      en: "Details",
      ar: "التفاصيل",
    },
  }

  const t_local = (key: string) => {
    return translations[key as keyof typeof translations]?.[language] || key
  }

  const handleViewDetails = (dossierId: string) => {
    router.push(`/${language}/admin/dossiers/${dossierId}`)
  }

  // Filter dossiers based on search term
  const filteredDossiers = dossiersClotures.filter(
    (dossier) =>
      dossier.num_sinistre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dossier.assure_nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (dossier.agence && dossier.agence.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  // Format date based on locale
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat(language === "fr" ? "fr-FR" : language === "ar" ? "ar-SA" : "en-US").format(date)
  }

  return (
    <DashboardLayout>
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <CardTitle>{t_local("title")}</CardTitle>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t_local("search")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t_local("claimNumber")}</TableHead>
                <TableHead>{t_local("agency")}</TableHead>
                <TableHead>{t_local("insuredName")}</TableHead>
                <TableHead>{t_local("updatedAt")}</TableHead>
                <TableHead>{t_local("status")}</TableHead>
                <TableHead className="text-right">{t_local("actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    {t_local("loading")}
                  </TableCell>
                </TableRow>
              ) : filteredDossiers.length > 0 ? (
                filteredDossiers.map((dossier) => (
                  <TableRow key={dossier.id}>
                    <TableCell className="font-medium">{dossier.num_sinistre}</TableCell>
                    <TableCell>{dossier.agence || "N/A"}</TableCell>
                    <TableCell>{dossier.assure_nom}</TableCell>
                    <TableCell>{formatDate(dossier.updated_at)}</TableCell>
                    <TableCell>
                      <Badge className="bg-green-100 text-green-800">{t_local("ended")}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(dossier.id)}
                        className="hover:bg-[#2E8BC0] hover:text-white transition-colors duration-200"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        {t_local("details")}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                    {t_local("noDossiers")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </DashboardLayout>
  )
}
