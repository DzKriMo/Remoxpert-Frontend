"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import { useLanguage } from "@/components/language-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, Eye, Filter } from "lucide-react"
import { getDossiers } from "@/lib/dossier-utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {dossierAPI} from "@/lib/api-client"

type DossierStatus = "new" | "in_progress" | "ended" | "rejected"

interface Dossier {
  id: string
  num_sinistre: string
  assure_nom: string
  agence: string
  status: DossierStatus
  created_at: string
  link_pv?: string
  link_note?: string
}

export default function DossiersPage() {
  const { t, language } = useLanguage()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [dossiers, setDossiers] = useState<Dossier[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  // Get status filter from URL on mount
  useEffect(() => {
    dossierAPI.postSeenAdmin();
    const urlStatus = searchParams.get("status")
    if (urlStatus) {
      setStatusFilter(urlStatus)
    }
  }, [searchParams])

  // Fetch dossiers on component mount
  useEffect(() => {
    const fetchDossiers = async () => {
      try {
        setLoading(true)
        const response = await getDossiers()
        setDossiers(response.data || [])
      } catch (error) {
        console.error("Error fetching dossiers:", error)
        setDossiers([])
      } finally {
        setLoading(false)
      }
    }

    fetchDossiers()
  }, [])

  // Translations for this page
  const translations = {
    title: {
      fr: "Dossiers",
      en: "Cases",
      ar: "الملفات",
    },
    claimNumber: {
      fr: "N° Sinistre",
      en: "Claim Number",
      ar: "رقم المطالبة",
    },
    insuredName: {
      fr: "Nom de l'assuré",
      en: "Insured Name",
      ar: "اسم المؤمن عليه",
    },
    agency: {
      fr: "Agence",
      en: "Agency",
      ar: "وكالة",
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
    actions: {
      fr: "Actions",
      en: "Actions",
      ar: "إجراءات",
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
    new: {
      fr: "Nouveau",
      en: "New",
      ar: "جديد",
    },
    in_progress: {
      fr: "En cours",
      en: "In Progress",
      ar: "قيد التقدم",
    },
    ended: {
      fr: "Terminé",
      en: "Ended",
      ar: "منتهي",
    },
    rejected: {
      fr: "Rejeté",
      en: "Rejected",
      ar: "مرفوض",
    },
    all: {
      fr: "Tous",
      en: "All",
      ar: "الكل",
    },
    search: {
      fr: "Rechercher...",
      en: "Search...",
      ar: "بحث...",
    },
    filterByStatus: {
      fr: "Filtrer par état",
      en: "Filter by status",
      ar: "تصفية حسب الحالة",
    },
    noDossiers: {
      fr: "Aucun dossier trouvé",
      en: "No cases found",
      ar: "لم يتم العثور على ملفات",
    },
    loading: {
      fr: "Chargement...",
      en: "Loading...",
      ar: "جار التحميل...",
    },
  }

  const t_local = (key: string) => {
    return translations[key as keyof typeof translations]?.[language] || key
  }

  const getStatusColor = (status: DossierStatus) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-800"
      case "in_progress":
        return "bg-yellow-100 text-yellow-800"
      case "ended":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleViewDetails = (dossierId: string) => {
    router.push(`/${language}/admin/dossiers/${dossierId}`)
  }

  // Filter dossiers based on search term and status
  const filteredDossiers = dossiers.filter((dossier) => {
    // Text search filter
    const matchesSearch =
      dossier.num_sinistre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dossier.assure_nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dossier.agence.toLowerCase().includes(searchTerm.toLowerCase())

    // Status filter
    const matchesStatus = statusFilter === "all" || dossier.status === statusFilter

    return matchesSearch && matchesStatus
  })

  return (
    <DashboardLayout>
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <CardTitle>{t_local("title")}</CardTitle>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t_local("search")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <div className="relative w-full sm:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className={statusFilter !== "all" ? "border-[#2E8BC0]" : ""}>
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder={t_local("filterByStatus")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t_local("all")}</SelectItem>
                  <SelectItem value="new">{t_local("new")}</SelectItem>
                  <SelectItem value="in_progress">{t_local("in_progress")}</SelectItem>
                  <SelectItem value="ended">{t_local("ended")}</SelectItem>
                  <SelectItem value="rejected">{t_local("rejected")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t_local("claimNumber")}</TableHead>
                <TableHead>{t_local("insuredName")}</TableHead>
                <TableHead>{t_local("agency")}</TableHead>
                <TableHead>{t_local("status")}</TableHead>
                <TableHead>{t_local("createdAt")}</TableHead>
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
                    <TableCell>{dossier.assure_nom}</TableCell>
                    <TableCell>{dossier.agence}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(dossier.status)}>{t_local(dossier.status)}</Badge>
                    </TableCell>
                    <TableCell>{new Date(dossier.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(dossier.id)}
                          className="hover:bg-[#2E8BC0] hover:text-white transition-colors duration-200"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          {t_local("details")}
                        </Button>
                      </div>
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
