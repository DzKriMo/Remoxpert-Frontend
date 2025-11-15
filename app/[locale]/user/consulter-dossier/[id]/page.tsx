"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import { useLanguage } from "@/components/language-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog-with-bg"
import { ArrowLeft, Download, Eye, Calendar, User, FileText, Car, Shield } from "lucide-react"
import { getDossier, downloadDossierFile, downloadAccidentPhoto } from "@/lib/dossier-utils"
import { Alert, AlertDescription } from "@/components/ui/alert"

type DossierStatus = "new" | "in_progress" | "ended" | "rejected"

interface DossierDetails {
  id: string
  num_sinistre: string
  agence: string
  date_sinistre: string
  date_declaration: string
  expert_nom?: string
  assure_nom: string
  num_police: string
  compagnie: string
  code_agence: string
  num_chassis: string
  matricule: string
  annee: number
  categorie: string
  date_debut_assurance: string
  date_fin_assurance: string
  tiers_nom: string
  tiers_matricule: string
  tiers_code_agence: string
  tiers_num_police: string
  tiers_compagnie: string
  status: DossierStatus
  created_at: string
  updated_at: string
  link_pv?: string
  link_note?: string
  photos_accident: string[]
  admin_comment?: string
  note_honoraire_montant?: string
}

export default function DossierDetailsPage() {
  const { t, language } = useLanguage()
  const router = useRouter()
  const params = useParams()
  const dossierId = params.id as string

  const [dossier, setDossier] = useState<DossierDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [imagePreview, setImagePreview] = useState<{
    isOpen: boolean
    src: string
    title: string
  }>({
    isOpen: false,
    src: "",
    title: "",
  })

  const [downloadingStates, setDownloadingStates] = useState<{ [key: string]: boolean }>({})

  // Fetch dossier details on component mount
  useEffect(() => {
    const fetchDossierDetails = async () => {
      try {
        setLoading(true)
        const response = await getDossier(dossierId)
        setDossier(response.data)
      } catch (error) {
        console.error("Error fetching dossier details:", error)
        setError("Erreur lors du chargement des détails du dossier")
      } finally {
        setLoading(false)
      }
    }

    if (dossierId) {
      fetchDossierDetails()
    }
  }, [dossierId])

  // Translations for this page
  const translations = {
    title: {
      fr: "Détails du Dossier",
      en: "Case Details",
      ar: "تفاصيل الملف",
    },
    backToList: {
      fr: "Retour à la liste",
      en: "Back to list",
      ar: "العودة إلى القائمة",
    },
    basicInfo: {
      fr: "Informations de base",
      en: "Basic Information",
      ar: "المعلومات الأساسية",
    },
    vehicleInfo: {
      fr: "Informations du véhicule",
      en: "Vehicle Information",
      ar: "معلومات المركبة",
    },
    insuranceInfo: {
      fr: "Informations d'assurance",
      en: "Insurance Information",
      ar: "معلومات التأمين",
    },
    thirdPartyInfo: {
      fr: "Informations du tiers",
      en: "Third Party Information",
      ar: "معلومات الطرف الثالث",
    },
    documents: {
      fr: "Documents",
      en: "Documents",
      ar: "المستندات",
    },
    accidentPhotos: {
      fr: "Photos de sinistre",
      en: "sinistre Photos",
      ar: "صور الحادث",
    },
    adminComments: {
      fr: "Commentaires de l'Expert",
      en: "Expert Comments",
      ar: "تعليقات الخبير",
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
      fr: "Dernière mise à jour",
      en: "Last Updated",
      ar: "آخر تحديث",
    },
    claimNumber: {
      fr: "N° Sinistre",
      en: "Claim Number",
      ar: "رقم المطالبة",
    },
    agency: {
      fr: "compagnie",
      en: "company",
      ar: "شركة",
    },
    claimDate: {
      fr: "Date du sinistre",
      en: "Claim Date",
      ar: "تاريخ المطالبة",
    },
    declarationDate: {
      fr: "Date de déclaration",
      en: "Declaration Date",
      ar: "تاريخ الإعلان",
    },
    expertName: {
      fr: "Nom de l'expert",
      en: "Expert Name",
      ar: "اسم الخبير",
    },
    insuredName: {
      fr: "Nom de l'assuré",
      en: "Insured Name",
      ar: "اسم المؤمن عليه",
    },
    policyNumber: {
      fr: "N° Police",
      en: "Policy Number",
      ar: "رقم البوليصة",
    },
    company: {
      fr: "Compagnie",
      en: "Company",
      ar: "الشركة",
    },
    agencyCode: {
      fr: "Code agence",
      en: "Agency Code",
      ar: "رمز الوكالة",
    },
    chassisNumber: {
      fr: "N° Châssis",
      en: "Chassis Number",
      ar: "رقم الهيكل",
    },
    registrationNumber: {
      fr: "Immatriculation",
      en: "Registration",
      ar: "رقم التسجيل",
    },
    year: {
      fr: "Année",
      en: "Year",
      ar: "السنة",
    },
    category: {
      fr: "Catégorie",
      en: "Category",
      ar: "الفئة",
    },
    insuranceStartDate: {
      fr: "Début assurance",
      en: "Insurance Start",
      ar: "بداية التأمين",
    },
    insuranceEndDate: {
      fr: "Fin assurance",
      en: "Insurance End",
      ar: "نهاية التأمين",
    },
    thirdPartyName: {
      fr: "Nom du tiers",
      en: "Third Party Name",
      ar: "اسم الطرف الثالث",
    },
    thirdPartyRegistration: {
      fr: "Immatriculation tiers",
      en: "Third Party Registration",
      ar: "تسجيل الطرف الثالث",
    },
    thirdPartyAgencyCode: {
      fr: "Code agence tiers",
      en: "Third Party Agency Code",
      ar: "رمز وكالة الطرف الثالث",
    },
    thirdPartyPolicyNumber: {
      fr: "N° Police tiers",
      en: "Third Party Policy",
      ar: "بوليصة الطرف الثالث",
    },
    thirdPartyCompany: {
      fr: "Compagnie tiers",
      en: "Third Party Company",
      ar: "شركة الطرف الثالث",
    },
    vehicleRegistration: {
      fr: "Carte Grise",
      en: "Vehicle Registration",
      ar: "تسجيل المركبة",
    },
    declarationFront: {
      fr: "Déclaration Recto",
      en: "Declaration Front",
      ar: "الإعلان الأمامي",
    },
    declarationBack: {
      fr: "Déclaration Verso",
      en: "Declaration Back",
      ar: "الإعلان الخلفي",
    },
    preview: {
      fr: "Aperçu",
      en: "Preview",
      ar: "معاينة",
    },
    download: {
      fr: "Télécharger",
      en: "Download",
      ar: "تنزيل",
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
    loading: {
      fr: "Chargement...",
      en: "Loading...",
      ar: "جار التحميل...",
    },
    errorLoading: {
      fr: "Erreur lors du chargement",
      en: "Error loading",
      ar: "خطأ في التحميل",
    },
    noData: {
      fr: "Aucune donnée",
      en: "No data",
      ar: "لا توجد بيانات",
    },
    pv: {
      fr: "PV",
      en: "PV",
      ar: "PV",
    },
    note: {
      fr: "Note",
      en: "Note",
      ar: "ملاحظة",
    },
    photo: {
      fr: "Photo",
      en: "Photo",
      ar: "صورة",
    },
    noAccidentPhotos: {
      fr: "Aucune photo de sinistre disponible",
      en: "No sinistre photos available",
      ar: "لا توجد صور حوادث متاحة",
    },
  }

  const t_local = (key: string) => {
    return translations[key as keyof typeof translations]?.[language as "fr" | "en" | "ar"] || key
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

  const formatDate = (dateString: string) => {
    if (!dateString) return t_local("noData")
    return new Date(dateString).toLocaleDateString(language === "fr" ? "fr-FR" : language === "ar" ? "ar-SA" : "en-US")
  }

  const handleImagePreview = async (type: "carte_grise" | "declaration_recto" | "declaration_verso", title: string) => {
    const previewKey = `preview-${type}`
    setDownloadingStates((prev) => ({ ...prev, [previewKey]: true }))

    try {
      const response = await downloadDossierFile(dossierId, type)
      const blob = new Blob([response.data])
      const imageUrl = URL.createObjectURL(blob)

      setImagePreview({
        isOpen: true,
        src: imageUrl,
        title,
      })
    } catch (error) {
      console.error("Error loading image preview:", error)
      alert("Erreur lors du chargement de l'aperçu")
    } finally {
      setDownloadingStates((prev) => ({ ...prev, [previewKey]: false }))
    }
  }

  const handleAccidentPhotoPreview = async (index: number) => {
    const previewKey = `preview-accident-${index}`
    setDownloadingStates((prev) => ({ ...prev, [previewKey]: true }))

    try {
      const response = await downloadAccidentPhoto(dossierId, index)
      const blob = new Blob([response.data])
      const imageUrl = URL.createObjectURL(blob)

      setImagePreview({
        isOpen: true,
        src: imageUrl,
        title: `${t_local("photo")} ${index + 1}`,
      })
    } catch (error) {
      console.error("Error loading accident photo preview:", error)
      alert("Erreur lors du chargement de l'aperçu")
    } finally {
      setDownloadingStates((prev) => ({ ...prev, [previewKey]: false }))
    }
  }

  const handleDownload = async (type: "pv" | "note" | "carte_grise" | "declaration_recto" | "declaration_verso") => {
    const downloadKey = `download-${type}`
    setDownloadingStates((prev) => ({ ...prev, [downloadKey]: true }))

    try {
      const response = await downloadDossierFile(dossierId, type)

      // Get the content type from response headers to determine file extension
      const contentType = response.headers["content-type"] || ""
      let fileExtension = ""

      if (contentType.includes("application/pdf")) {
        fileExtension = ".pdf"
      } else if (contentType.includes("image/jpeg") || contentType.includes("image/jpg")) {
        fileExtension = ".jpg"
      } else if (contentType.includes("image/png")) {
        fileExtension = ".png"
      } else if (contentType.includes("application/msword")) {
        fileExtension = ".doc"
      } else if (contentType.includes("application/vnd.openxmlformats-officedocument.wordprocessingml.document")) {
        fileExtension = ".docx"
      } else {
        // Default fallback
        fileExtension = type === "pv" || type === "note" ? ".pdf" : ".jpg"
      }

      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", `${type}-${dossierId}${fileExtension}`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error(`Error downloading ${type}:`, error)
      alert(`Erreur lors du téléchargement: ${type}`)
    } finally {
      setDownloadingStates((prev) => ({ ...prev, [downloadKey]: false }))
    }
  }

  const handleAccidentPhotoDownload = async (index: number) => {
    const downloadKey = `download-accident-${index}`
    setDownloadingStates((prev) => ({ ...prev, [downloadKey]: true }))

    try {
      const response = await downloadAccidentPhoto(dossierId, index)

      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", `accident-photo-${index + 1}-${dossierId}.jpg`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error(`Error downloading accident photo ${index}:`, error)
      alert(`Erreur lors du téléchargement de la photo ${index + 1}`)
    } finally {
      setDownloadingStates((prev) => ({ ...prev, [downloadKey]: false }))
    }
  }

  const handleLinkDownload = (link: string) => {
    window.open(link, "_blank")
  }

  const closeImagePreview = () => {
    if (imagePreview.src) {
      URL.revokeObjectURL(imagePreview.src)
    }
    setImagePreview({
      isOpen: false,
      src: "",
      title: "",
    })
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2E8BC0] mx-auto mb-4"></div>
            <p>{t_local("loading")}</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error || !dossier) {
    return (
      <DashboardLayout>
        <Alert variant="destructive">
          <AlertDescription>{error || t_local("errorLoading")}</AlertDescription>
        </Alert>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 fade-in">
        {/* Header */}
        <div className="flex items-center justify-between slide-in-up">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => router.push(`/${language}/user/consulter-dossier`)}
              className="hover:bg-[#2E8BC0] hover:text-white transition-colors duration-200 btn-secondary-animated focus-enhanced"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t_local("backToList")}
            </Button>
            <div>
              <h1 className="text-2xl font-bold gradient-text">
                {t_local("title")}
              </h1>
              <p className="text-muted-foreground">{dossier.num_sinistre}</p>
            </div>
          </div>
          <Badge className={`${getStatusColor(dossier.status)} scale-in`}>
            {t_local(dossier.status)}
          </Badge>
        </div>

 {dossier.note_honoraire_montant && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#2ec083]" />
                Montant Note Honoraire
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-blue-50 border-l-4 border-green-400 p-4 rounded-r-lg">
                <p className="text-green-800">
                  {dossier.note_honoraire_montant}
                </p>
              </div>
            </CardContent>
          </Card>
        )}


        {/* Admin Comments Section */}
        {dossier.admin_comment && (
          <Card
            className="card-interactive slide-in-up"
            style={{ animationDelay: "0.1s" }}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#2E8BC0]" />
                {t_local("adminComments")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                <p className="text-blue-800 font-medium">
                  {dossier.admin_comment}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Basic Information */}
        <Card
          className="card-interactive slide-in-left"
          style={{ animationDelay: "0.2s" }}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-[#2E8BC0]" />
              {t_local("basicInfo")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground">
                  {t_local("claimNumber")}
                </label>
                <p className="font-medium">{dossier.num_sinistre}</p>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground">
                  {t_local("agency")}
                </label>
                <p className="font-medium">
                  {dossier.agence || t_local("noData")}
                </p>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground">
                  {t_local("agencyCode")}
                </label>
                <p className="font-medium">
                  {dossier.code_agence || t_local("noData")}
                </p>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground">
                  {t_local("claimDate")}
                </label>
                <p className="font-medium flex items-center gap-1">
                  <Calendar className="h-4 w-4 text-[#2E8BC0]" />
                  {formatDate(dossier.date_sinistre)}
                </p>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground">
                  {t_local("declarationDate")}
                </label>
                <p className="font-medium flex items-center gap-1">
                  <Calendar className="h-4 w-4 text-[#2E8BC0]" />
                  {formatDate(dossier.date_declaration)}
                </p>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground">
                  {t_local("expertName")}
                </label>
                <p className="font-medium flex items-center gap-1">
                  <User className="h-4 w-4 text-[#2E8BC0]" />
                  {dossier.expert_nom || t_local("noData")}
                </p>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground">
                  {t_local("createdAt")}
                </label>
                <p className="font-medium">{formatDate(dossier.created_at)}</p>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground">
                  {t_local("updatedAt")}
                </label>
                <p className="font-medium">{formatDate(dossier.updated_at)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vehicle Information */}
        <Card
          className="card-interactive slide-in-right"
          style={{ animationDelay: "0.3s" }}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5 text-[#2E8BC0]" />
              {t_local("vehicleInfo")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground">
                  {t_local("chassisNumber")}
                </label>
                <p className="font-medium">
                  {dossier.num_chassis || t_local("noData")}
                </p>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground">
                  {t_local("registrationNumber")}
                </label>
                <p className="font-medium">
                  {dossier.matricule || t_local("noData")}
                </p>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground">
                  {t_local("year")}
                </label>
                <p className="font-medium">{dossier.annee}</p>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground">
                  {t_local("category")}
                </label>
                <p className="font-medium">{dossier.categorie}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Insurance Information */}
        <Card
          className="card-interactive slide-in-left"
          style={{ animationDelay: "0.4s" }}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-[#2E8BC0]" />
              {t_local("insuranceInfo")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground">
                  {t_local("insuredName")}
                </label>
                <p className="font-medium">{dossier.assure_nom}</p>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground">
                  {t_local("policyNumber")}
                </label>
                <p className="font-medium">
                  {dossier.num_police || t_local("noData")}
                </p>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground">
                  {t_local("company")}
                </label>
                <p className="font-medium">
                  {dossier.compagnie || t_local("noData")}
                </p>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground">
                  {t_local("insuranceStartDate")}
                </label>
                <p className="font-medium">
                  {formatDate(dossier.date_debut_assurance)}
                </p>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground">
                  {t_local("insuranceEndDate")}
                </label>
                <p className="font-medium">
                  {formatDate(dossier.date_fin_assurance)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Third Party Information */}
        <Card
          className="card-interactive slide-in-right"
          style={{ animationDelay: "0.5s" }}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-[#2E8BC0]" />
              {t_local("thirdPartyInfo")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground">
                  {t_local("thirdPartyName")}
                </label>
                <p className="font-medium">
                  {dossier.tiers_nom || t_local("noData")}
                </p>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground">
                  {t_local("thirdPartyRegistration")}
                </label>
                <p className="font-medium">
                  {dossier.tiers_matricule || t_local("noData")}
                </p>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground">
                  {t_local("thirdPartyAgencyCode")}
                </label>
                <p className="font-medium">
                  {dossier.tiers_code_agence || t_local("noData")}
                </p>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground">
                  {t_local("thirdPartyPolicyNumber")}
                </label>
                <p className="font-medium">
                  {dossier.tiers_num_police || t_local("noData")}
                </p>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground">
                  {t_local("thirdPartyCompany")}
                </label>
                <p className="font-medium">
                  {dossier.tiers_compagnie || t_local("noData")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Documents */}
        <Card
          className="card-interactive slide-in-up"
          style={{ animationDelay: "0.6s" }}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-[#2E8BC0]" />
              {t_local("documents")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* Vehicle Registration */}
              <div className="border rounded-lg p-4 hover:shadow-md transition-all duration-300">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  {t_local("vehicleRegistration")}
                </h4>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleImagePreview(
                        "carte_grise",
                        t_local("vehicleRegistration")
                      )
                    }
                    disabled={downloadingStates["preview-carte_grise"]}
                    className="flex-1 hover:bg-blue-600 hover:text-white transition-colors duration-200"
                  >
                    {downloadingStates["preview-carte_grise"] ? (
                      <div className="spinner h-4 w-4 mr-1" />
                    ) : (
                      <Eye className="h-4 w-4 mr-1 icon" />
                    )}
                    {t_local("preview")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload("carte_grise")}
                    disabled={downloadingStates["download-carte_grise"]}
                    className="flex-1 hover:bg-green-600 hover:text-white transition-colors duration-200"
                  >
                    {downloadingStates["download-carte_grise"] ? (
                      <div className="spinner h-4 w-4 mr-1" />
                    ) : (
                      <Download className="h-4 w-4 mr-1 icon" />
                    )}
                    {t_local("download")}
                  </Button>
                </div>
              </div>

              {/* Declaration Front */}
              <div className="border rounded-lg p-4 hover:shadow-md transition-all duration-300">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  {t_local("declarationFront")}
                </h4>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleImagePreview(
                        "declaration_recto",
                        t_local("declarationFront")
                      )
                    }
                    disabled={downloadingStates["preview-declaration_recto"]}
                    className="flex-1 hover:bg-blue-600 hover:text-white transition-colors duration-200"
                  >
                    {downloadingStates["preview-declaration_recto"] ? (
                      <div className="spinner h-4 w-4 mr-1" />
                    ) : (
                      <Eye className="h-4 w-4 mr-1 icon" />
                    )}
                    {t_local("preview")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload("declaration_recto")}
                    disabled={downloadingStates["download-declaration_recto"]}
                    className="flex-1 hover:bg-green-600 hover:text-white transition-colors duration-200"
                  >
                    {downloadingStates["download-declaration_recto"] ? (
                      <div className="spinner h-4 w-4 mr-1" />
                    ) : (
                      <Download className="h-4 w-4 mr-1 icon" />
                    )}
                    {t_local("download")}
                  </Button>
                </div>
              </div>

              {/* Declaration Back */}
              <div className="border rounded-lg p-4 hover:shadow-md transition-all duration-300">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  {t_local("declarationBack")}
                </h4>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleImagePreview(
                        "declaration_verso",
                        t_local("declarationBack")
                      )
                    }
                    disabled={downloadingStates["preview-declaration_verso"]}
                    className="flex-1 hover:bg-blue-600 hover:text-white transition-colors duration-200"
                  >
                    {downloadingStates["preview-declaration_verso"] ? (
                      <div className="spinner h-4 w-4 mr-1" />
                    ) : (
                      <Eye className="h-4 w-4 mr-1 icon" />
                    )}
                    {t_local("preview")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload("declaration_verso")}
                    disabled={downloadingStates["download-declaration_verso"]}
                    className="flex-1 hover:bg-green-600 hover:text-white transition-colors duration-200"
                  >
                    {downloadingStates["download-declaration_verso"] ? (
                      <div className="spinner h-4 w-4 mr-1" />
                    ) : (
                      <Download className="h-4 w-4 mr-1 icon" />
                    )}
                    {t_local("download")}
                  </Button>
                </div>
              </div>
            </div>

            {/* PV and Note Downloads */}
            <div className="pt-6 border-t">
              <div className="flex gap-4 justify-center">
                <Button
                  variant="outline"
                  onClick={() => handleDownload("pv")}
                  disabled={
                    dossier.status !== "ended" ||
                    downloadingStates["download-pv"]
                  }
                  className={`bg-green-600 hover:text-black text-white transition-colors duration-200 ${dossier.status !== "ended" ? "opacity-50 cursor-not-allowed" : ""} btn-download focus-enhanced`}
                >
                  {downloadingStates["download-pv"] ? (
                    <div className="spinner h-4 w-4 mr-2" />
                  ) : (
                    <Download className="h-4 w-4 mr-2 icon" />
                  )}
                  {t_local("pv")}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleDownload("note")}
                  disabled={
                    dossier.status !== "ended" ||
                    downloadingStates["download-note"]
                  }
                  className={`bg-green-600 hover:text-black text-white transition-colors duration-200 ${dossier.status !== "ended" ? "opacity-50 cursor-not-allowed" : ""} btn-download focus-enhanced`}
                >
                  {downloadingStates["download-note"] ? (
                    <div className="spinner h-4 w-4 mr-2" />
                  ) : (
                    <Download className="h-4 w-4 mr-2 icon" />
                  )}
                  {t_local("note")}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Accident Photos */}
        <Card
          className="card-interactive slide-in-up"
          style={{ animationDelay: "0.7s" }}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {t_local("accidentPhotos")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dossier.photos_accident && dossier.photos_accident.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dossier.photos_accident.map((photo, index) => (
                  <div
                    key={index}
                    className="border rounded-lg p-4 hover:shadow-md transition-all duration-300 scale-in"
                    style={{ animationDelay: `${0.8 + index * 0.1}s` }}
                  >
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      {t_local("photo")} {index + 1}
                    </h4>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAccidentPhotoPreview(index)}
                        disabled={
                          downloadingStates[`preview-accident-${index}`]
                        }
                        className="flex-1 hover:bg-blue-600 hover:text-white transition-colors duration-200"
                      >
                        {downloadingStates[`preview-accident-${index}`] ? (
                          <div className="spinner h-4 w-4 mr-1" />
                        ) : (
                          <Eye className="h-4 w-4 mr-1 icon" />
                        )}
                        {t_local("preview")}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAccidentPhotoDownload(index)}
                        disabled={
                          downloadingStates[`download-accident-${index}`]
                        }
                        className="flex-1 hover:bg-green-600 hover:text-white transition-colors duration-200"
                      >
                        {downloadingStates[`download-accident-${index}`] ? (
                          <div className="spinner h-4 w-4 mr-1" />
                        ) : (
                          <Download className="h-4 w-4 mr-1 icon" />
                        )}
                        {t_local("download")}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">
                  {t_local("noAccidentPhotos")}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Image Preview Dialog */}
      <Dialog open={imagePreview.isOpen} onOpenChange={closeImagePreview}>
        <DialogContent className="max-w-4xl max-h-[90vh] bg-white scale-in">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {imagePreview.title}
            </DialogTitle>
          </DialogHeader>
          <div className="flex justify-center items-center max-h-[70vh] overflow-auto">
            {imagePreview.src && (
              <img
                src={imagePreview.src || "/placeholder.svg"}
                alt={imagePreview.title}
                className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
