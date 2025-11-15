"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import { useLanguage } from "@/components/language-provider"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog-with-bg"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Edit, Eye, Download, Upload, Calendar, User, FileText, Car, Shield } from "lucide-react"
import {
  getDossier,
  updateDossier,
  uploadAdminDocs,
  downloadDossierFile,
  downloadAccidentPhoto,
} from "@/lib/dossier-utils"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type DossierStatus = "new" | "in_progress" | "ended" | "rejected"

interface DossierDetails {
  id: string;
  num_sinistre: string;
  agence: string;
  date_sinistre: string;
  date_declaration: string;
  expert_nom?: string;
  assure_nom: string;
  num_police: string;
  compagnie: string;
  code_agence: string;
  num_chassis: string;
  matricule: string;
  annee: number;
  categorie: string;
  date_debut_assurance: string;
  date_fin_assurance: string;
  tiers_nom: string;
  tiers_matricule: string;
  tiers_code_agence: string;
  tiers_num_police: string;
  tiers_compagnie: string;
  status: DossierStatus;
  created_at: string;
  updated_at: string;
  link_pv?: string;
  link_note?: string;
  photos_accident: string[];
  admin_comment?: string;
  note_honoraire_montant?: string;
}

export default function AdminDossierDetailsPage() {
  const { t, language } = useLanguage()
  const router = useRouter()
  const params = useParams()
  const dossierId = params.id as string

  const [dossier, setDossier] = useState<DossierDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [imagePreview, setImagePreview] = useState<{
    isOpen: boolean
    src: string
    title: string
  }>({
    isOpen: false,
    src: "",
    title: "",
  })
  const [editForm, setEditForm] = useState({
    status: "new" as DossierStatus,
    link_pv: "",
    link_note: "",
    admin_comment: "",
    note_honoraire_montant:"",
  });

  // File upload state
  const [uploadFiles, setUploadFiles] = useState<{
    pv_file: File | null
    note_file: File | null
  }>({
    pv_file: null,
    note_file: null,
  })

  // File input refs
  const pvFileRef = useRef<HTMLInputElement>(null)
  const noteFileRef = useRef<HTMLInputElement>(null)

  // Fetch dossier details on component mount
  useEffect(() => {
    const fetchDossierDetails = async () => {
      try {
        setLoading(true)
        const response = await getDossier(dossierId)
        setDossier(response.data)
        setEditForm({
          status: response.data.status,
          link_pv: response.data.link_pv || "",
          link_note: response.data.link_note || "",
          admin_comment: response.data.admin_comment || "",
          note_honoraire_montant: response.data.note_honoraire_montant || "",
        })
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
    edit: {
      fr: "Modifier",
      en: "Edit",
      ar: "تعديل",
    },
    editDossier: {
      fr: "Modifier le dossier",
      en: "Edit Case",
      ar: "تعديل الملف",
    },
    uploadDocs: {
      fr: "Télécharger Documents",
      en: "Upload Documents",
      ar: "تحميل المستندات",
    },
    uploadAdminDocs: {
      fr: "Télécharger Documents Admin",
      en: "Upload Admin Documents",
      ar: "تحميل مستندات المسؤول",
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
      en: "sinister Photos",
      ar: "صور الحادث",
    },
    adminComments: {
      fr: "Commentaires Admin",
      en: "Admin Comments",
      ar: "تعليقات المسؤول",
    },
    status: {
      fr: "État",
      en: "Status",
      ar: "الحالة",
    },
    adminComment: {
      fr: "Commentaire Admin",
      en: "Admin Comment",
      ar: "تعليق المسؤول",
    },
    addComment: {
      fr: "Ajouter un commentaire...",
      en: "Add a comment...",
      ar: "إضافة تعليق...",
    },
    pvLink: {
      fr: "Lien PV",
      en: "PV Link",
      ar: "رابط PV",
    },
    noteLink: {
      fr: "Lien Note",
      en: "Note Link",
      ar: "رابط الملاحظة",
    },
    pvFile: {
      fr: "Fichier PV",
      en: "PV File",
      ar: "ملف PV",
    },
    noteFile: {
      fr: "Fichier Note",
      en: "Note File",
      ar: "ملف الملاحظة",
    },
    save: {
      fr: "Enregistrer",
      en: "Save",
      ar: "حفظ",
    },
    upload: {
      fr: "Télécharger",
      en: "Upload",
      ar: "تحميل",
    },
    cancel: {
      fr: "Annuler",
      en: "Cancel",
      ar: "إلغاء",
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
    photo: {
      fr: "Photo",
      en: "Photo",
      ar: "صورة",
    },
    noAccidentPhotos: {
      fr: "Aucune photo de sinistre disponible",
      en: "No sinister photos available",
      ar: "لا توجد صور حوادث متاحة",
    },
    noAdminComment: {
      fr: "Aucun commentaire admin",
      en: "No admin comment",
      ar: "لا يوجد تعليق من المسؤول",
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
      fr: "Agence",
      en: "Agency",
      ar: "وكالة",
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
    noData: {
      fr: "Aucune donnée",
      en: "No data",
      ar: "لا توجد بيانات",
    },
    fileSelected: {
      fr: "Fichier sélectionné",
      en: "File selected",
      ar: "تم تحديد الملف",
    },
    noFileSelected: {
      fr: "Aucun fichier sélectionné",
      en: "No file selected",
      ar: "لم يتم تحديد ملف",
    },
    fileRequirements: {
      fr: "Formats acceptés: PDF, DOC, DOCX (max 10MB)",
      en: "Accepted formats: PDF, DOC, DOCX (max 10MB)",
      ar: "التنسيقات المقبولة: PDF، DOC، DOCX (حد أقصى 10 ميجابايت)",
    },
    uploadSuccess: {
      fr: "Documents téléchargés avec succès",
      en: "Documents uploaded successfully",
      ar: "تم تحميل المستندات بنجاح",
    },
    updateSuccess: {
      fr: "Dossier mis à jour avec succès",
      en: "Case updated successfully",
      ar: "تم تحديث الملف بنجاح",
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

  const handleUpdateDossier = async () => {
    if (!dossier) return

    setUpdating(true)
    try {
      // Update the dossier with status and admin comment
      await updateDossier(dossier.id, {
        status: editForm.status,
        admin_comment: editForm.admin_comment,
        note_honoraire_montant: editForm.note_honoraire_montant,
      });

      // Then upload files if any are selected
      if (uploadFiles.pv_file || uploadFiles.note_file) {
        const response = await uploadAdminDocs(dossier.id, uploadFiles)

        // Update local state with new file links
        setDossier({
          ...dossier,
          status: editForm.status,
          admin_comment: editForm.admin_comment,
          link_pv: response.data.link_pv || dossier.link_pv,
          link_note: response.data.link_note || dossier.link_note,
        })
      } else {
        // Update local state with just the status and comment changes
        setDossier({
          ...dossier,
          status: editForm.status,
          admin_comment: editForm.admin_comment,
        })
      }

      // Reset upload state
      setUploadFiles({
        pv_file: null,
        note_file: null,
      })

      setIsEditDialogOpen(false)
    } catch (error) {
      console.error("Error updating dossier:", error)
    } finally {
      setUpdating(false)
    }
  }

  const handleFileUpload = (type: "pv_file" | "note_file") => (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadFiles((prev) => ({
        ...prev,
        [type]: e.target.files![0],
      }))
    }
  }

  const handleUploadAdminDocs = async () => {
    if (!dossier || (!uploadFiles.pv_file && !uploadFiles.note_file)) return

    setUploading(true)
    try {
      const response = await uploadAdminDocs(dossier.id, uploadFiles)

      // Update local state with new file links
      setDossier({
        ...dossier,
        link_pv: response.data.link_pv || dossier.link_pv,
        link_note: response.data.link_note || dossier.link_note,
      })

      // Reset upload state
      setUploadFiles({
        pv_file: null,
        note_file: null,
      })

      setIsUploadDialogOpen(false)
    } catch (error) {
      console.error("Error uploading admin docs:", error)
    } finally {
      setUploading(false)
    }
  }

  const handleImagePreview = async (type: "carte_grise" | "declaration_recto" | "declaration_verso", title: string) => {
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
    }
  }

  const handleAccidentPhotoPreview = async (index: number) => {
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
    }
  }

  const handleDownload = async (type: "pv" | "note" | "carte_grise" | "declaration_recto" | "declaration_verso") => {
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
    }
  }

  const handleAccidentPhotoDownload = async (index: number) => {
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
      alert(`Erreur lors du téléchargement de la صورة ${index + 1}`)
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
            <p>Chargement...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error || !dossier) {
    return (
      <DashboardLayout>
        <Alert variant="destructive">
          <AlertDescription>{error || "Erreur lors du chargement"}</AlertDescription>
        </Alert>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => router.push(`/${language}/admin/dossiers`)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              {t_local("backToList")}
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{t_local("title")}</h1>
              <p className="text-muted-foreground">{dossier.num_sinistre}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(dossier.status)}>
              {t_local(dossier.status)}
            </Badge>
            <Button
              onClick={() => setIsEditDialogOpen(true)}
              className="bg-[#2E8BC0] hover:bg-[#1F3B4D] transition-colors duration-200"
            >
              <Edit className="h-4 w-4 mr-2" />
              {t_local("edit")}
            </Button>
          </div>
        </div>

        {/* Admin Comments Section */}
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
        {dossier.admin_comment && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#2E8BC0]" />
                {t_local("adminComments")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                <p className="text-blue-800">{dossier.admin_comment}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {t_local("basicInfo")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t_local("claimNumber")}
                </label>
                <p className="font-medium">{dossier.num_sinistre}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t_local("agency")}
                </label>
                <p className="font-medium">
                  {dossier.agence || t_local("noData")}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t_local("agencyCode")}
                </label>
                <p className="font-medium">
                  {dossier.code_agence || t_local("noData")}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t_local("claimDate")}
                </label>
                <p className="font-medium flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {formatDate(dossier.date_sinistre)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t_local("declarationDate")}
                </label>
                <p className="font-medium flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {formatDate(dossier.date_declaration)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t_local("expertName")}
                </label>
                <p className="font-medium flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {dossier.expert_nom || t_local("noData")}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t_local("createdAt")}
                </label>
                <p className="font-medium">{formatDate(dossier.created_at)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t_local("updatedAt")}
                </label>
                <p className="font-medium">{formatDate(dossier.updated_at)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vehicle Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5" />
              {t_local("vehicleInfo")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t_local("chassisNumber")}
                </label>
                <p className="font-medium">
                  {dossier.num_chassis || t_local("noData")}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t_local("registrationNumber")}
                </label>
                <p className="font-medium">
                  {dossier.matricule || t_local("noData")}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t_local("year")}
                </label>
                <p className="font-medium">{dossier.annee}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t_local("category")}
                </label>
                <p className="font-medium">{dossier.categorie}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Insurance Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              {t_local("insuranceInfo")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t_local("insuredName")}
                </label>
                <p className="font-medium">{dossier.assure_nom}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t_local("policyNumber")}
                </label>
                <p className="font-medium">
                  {dossier.num_police || t_local("noData")}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t_local("company")}
                </label>
                <p className="font-medium">
                  {dossier.compagnie || t_local("noData")}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t_local("insuranceStartDate")}
                </label>
                <p className="font-medium">
                  {formatDate(dossier.date_debut_assurance)}
                </p>
              </div>
              <div>
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {t_local("thirdPartyInfo")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t_local("thirdPartyName")}
                </label>
                <p className="font-medium">
                  {dossier.tiers_nom || t_local("noData")}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t_local("thirdPartyRegistration")}
                </label>
                <p className="font-medium">
                  {dossier.tiers_matricule || t_local("noData")}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t_local("thirdPartyAgencyCode")}
                </label>
                <p className="font-medium">
                  {dossier.tiers_code_agence || t_local("noData")}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t_local("thirdPartyPolicyNumber")}
                </label>
                <p className="font-medium">
                  {dossier.tiers_num_police || t_local("noData")}
                </p>
              </div>
              <div>
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
        <Card>
          <CardHeader>
            <CardTitle>{t_local("documents")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Vehicle Registration */}
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-2">
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
                    className="hover:bg-blue-600 hover:text-white transition-colors duration-200"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    {t_local("preview")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload("carte_grise")}
                    className="hover:bg-green-600 hover:text-white transition-colors duration-200"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    {t_local("download")}
                  </Button>
                </div>
              </div>

              {/* Declaration Front */}
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-2">
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
                    className="hover:bg-blue-600 hover:text-white transition-colors duration-200"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    {t_local("preview")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload("declaration_recto")}
                    className="hover:bg-green-600 hover:text-white transition-colors duration-200"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    {t_local("download")}
                  </Button>
                </div>
              </div>

              {/* Declaration Back */}
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-2">
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
                    className="hover:bg-blue-600 hover:text-white transition-colors duration-200"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    {t_local("preview")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload("declaration_verso")}
                    className="hover:bg-green-600 hover:text-white transition-colors duration-200"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    {t_local("download")}
                  </Button>
                </div>
              </div>
            </div>

            {/* PV and Note Downloads */}
            <div className="mt-6 pt-6 border-t">
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={() => handleDownload("pv")}
                  disabled={dossier.status !== "ended"}
                  className="hover:bg-green-600 hover:text-white transition-colors duration-200"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {t_local("pv")}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleDownload("note")}
                  disabled={dossier.status !== "ended"}
                  className="hover:bg-green-600 hover:text-white transition-colors duration-200"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {t_local("note")}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Accident Photos */}
        <Card>
          <CardHeader>
            <CardTitle>{t_local("accidentPhotos")}</CardTitle>
          </CardHeader>
          <CardContent>
            {dossier.photos_accident && dossier.photos_accident.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dossier.photos_accident.map((photo, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">
                      {t_local("photo")} {index + 1}
                    </h4>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAccidentPhotoPreview(index)}
                        className="hover:bg-blue-600 hover:text-white transition-colors duration-200"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        {t_local("preview")}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAccidentPhotoDownload(index)}
                        className="hover:bg-green-600 hover:text-white transition-colors duration-200"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        {t_local("download")}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>{t_local("noAccidentPhotos")}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Dossier Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-lg bg-white">
          <DialogHeader>
            <DialogTitle>
              {t_local("editDossier")} - {dossier.num_sinistre}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="status">{t_local("status")}</Label>
              <Select
                value={editForm.status}
                onValueChange={(value: DossierStatus) =>
                  setEditForm({ ...editForm, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t_local("status")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">{t_local("new")}</SelectItem>
                  <SelectItem value="in_progress">
                    {t_local("in_progress")}
                  </SelectItem>
                  <SelectItem value="ended">{t_local("ended")}</SelectItem>
                  <SelectItem value="rejected">
                    {t_local("rejected")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin_comment">{t_local("adminComment")}</Label>
              <Textarea
                id="admin_comment"
                placeholder={t_local("addComment")}
                value={editForm.admin_comment}
                onChange={(e) =>
                  setEditForm({ ...editForm, admin_comment: e.target.value })
                }
                rows={4}
                className="resize-none"
              />
            </div>

            <div className="text-sm text-muted-foreground">
              <p>{t_local("fileRequirements")}</p>
            </div>

            <div className="space-y-2">
              <Label>{t_local("pvFile")}</Label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    ref={pvFileRef}
                    onChange={handleFileUpload("pv_file")}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => pvFileRef.current?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {uploadFiles.pv_file
                      ? t_local("fileSelected")
                      : t_local("upload")}
                  </Button>
                </div>
              </div>
              {uploadFiles.pv_file && (
                <p className="text-sm text-muted-foreground">
                  {uploadFiles.pv_file.name}
                </p>
              )}
              {dossier.link_pv && !uploadFiles.pv_file && (
                <p className="text-sm text-green-600">PV existant disponible</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>{t_local("noteFile")}</Label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    ref={noteFileRef}
                    onChange={handleFileUpload("note_file")}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => noteFileRef.current?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {uploadFiles.note_file
                      ? t_local("fileSelected")
                      : t_local("upload")}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="note_honoraire_montant">
                  Montant de la note d'honoraires
                </Label>
                <Textarea
                  id="note montant"
                  placeholder="Ajouter un montant pour la note d'honoraires"
                  value={editForm.note_honoraire_montant}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      note_honoraire_montant: e.target.value,
                    })
                  }
                  rows={2}
                  className="resize-none"
                />
              </div>
              {uploadFiles.note_file && (
                <p className="text-sm text-muted-foreground">
                  {uploadFiles.note_file.name}
                </p>
              )}
              {dossier.link_note && !uploadFiles.note_file && (
                <p className="text-sm text-green-600">
                  Note existante disponible
                </p>
              )}
            </div>
          </div>
          <DialogFooter className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              {t_local("cancel")}
            </Button>
            <Button
              onClick={handleUpdateDossier}
              disabled={updating}
              className="bg-[#2E8BC0] hover:bg-[#1F3B4D]"
            >
              {updating ? "..." : t_local("save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Preview Dialog */}
      <Dialog open={imagePreview.isOpen} onOpenChange={closeImagePreview}>
        <DialogContent className="max-w-4xl max-h-[90vh] bg-white">
          <DialogHeader>
            <DialogTitle>{imagePreview.title}</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center items-center max-h-[70vh] overflow-auto">
            {imagePreview.src && (
              <img
                src={imagePreview.src || "/placeholder.svg"}
                alt={imagePreview.title}
                className="max-w-full max-h-full object-contain"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
