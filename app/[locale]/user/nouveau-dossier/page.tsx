"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/dashboard-layout";
import { useLanguage } from "@/components/language-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { dossierAPI } from "@/lib/api-client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog-with-bg";
import { Upload, Eye, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { type DossierFormData, createDossier } from "@/lib/dossier-utils";
import { format } from "date-fns";

export default function NouveauDossierPage() {
  const { t, language } = useLanguage();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [experts, setExpertsList] = useState<
    Array<{ id: number; name: string }>
  >([]);

  // Image preview state
  const [imagePreview, setImagePreview] = useState<{
    isOpen: boolean;
    src: string;
    title: string;
    type: "single" | "multiple";
    files?: File[];
    currentIndex?: number;
  }>({
    isOpen: false,
    src: "",
    title: "",
    type: "single",
  });

  // File input refs
  const carteGriseRef = useRef<HTMLInputElement>(null);
  const declarationRectoRef = useRef<HTMLInputElement>(null);
  const declarationVersoRef = useRef<HTMLInputElement>(null);
  const photosAccidentRef = useRef<HTMLInputElement>(null);
  const qrFileInputRef = useRef<HTMLInputElement>(null);
  const qrPreviewRef = useRef<HTMLImageElement>(null);

  // Form data state
  const [formData, setFormData] = useState<DossierFormData>({
    agence: "",
    num_sinistre: "",
    date_sinistre: format(new Date(), "yyyy-MM-dd"),
    date_declaration: format(new Date(), "yyyy-MM-dd"),
    expert_nom: "",
    expert_id: null,
    assure_nom: "",
    num_police: "",
    compagnie: "",
    code_agence: "",
    num_chassis: "",
    matricule: "",
    annee: new Date().getFullYear(),
    categorie: "LEGER",
    date_debut_assurance: "",
    date_fin_assurance: "",
    tiers_nom: "",
    tiers_matricule: "",
    tiers_code_agence: "",
    tiers_num_police: "",
    tiers_compagnie: "",
    carte_grise_photo: null,
    declaration_recto_photo: null,
    declaration_verso_photo: null,
    photos_accident: [],
  });


  const fetchExperts = async () => {
    try {
      const response = await dossierAPI.getExperts();
      setExpertsList(response.data);
      console.log("experts",response.data);
    } catch (error) {
      console.error("Error fetching experts:", error);
    }
  };

  // QR code scanning states
  const [qrScanLoading, setQrScanLoading] = useState(false);
  const [qrScanError, setQrScanError] = useState<string | null>(null);
  const [qrScanResult, setQrScanResult] = useState<string | null>(null);

  useEffect(() => {
    // Load client information from localStorage
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setFormData((prev) => ({
          ...prev,
          agence: user.nom || user.name || "",
          code_agence: user.code || user.code_agence || "",
          compagnie: user.nom || user.name || "",
        }));
      } catch (error) {
        console.error("Error loading user data:", error);
        // Still set expert name even if user data fails
        setFormData((prev) => ({
          ...prev,
          
        }));
      }
    } else {
      // Set expert name even if no user data
      setFormData((prev) => ({
        ...prev,
       
      }));
    }
    fetchExperts();
  }, []);

  // Translations for this page
  const translations = {
    title: {
      fr: "Nouveau Dossier",
      en: "New Case",
      ar: "ملف جديد",
    },
    enterManually: {
      fr: "Saisir manuellement",
      en: "Enter manually",
      ar: "أدخل يدويًا",
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
    photos: {
      fr: "Photos (Obligatoires)",
      en: "Photos (Required)",
      ar: "الصور (مطلوبة)",
    },
    agency: {
      fr: "Agence",
      en: "Agency",
      ar: "وكالة",
    },
    claimNumber: {
      fr: "Numéro de sinistre",
      en: "Claim Number",
      ar: "رقم المطالبة",
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
      fr: "Numéro de police",
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
      fr: "Numéro de châssis",
      en: "Chassis Number",
      ar: "رقم الهيكل",
    },
    registrationNumber: {
      fr: "Numéro d'immatriculation",
      en: "Registration Number",
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
      fr: "Date de début d'assurance",
      en: "Insurance Start Date",
      ar: "تاريخ بدء التأمين",
    },
    insuranceEndDate: {
      fr: "Date de fin d'assurance",
      en: "Insurance End Date",
      ar: "تاريخ انتهاء التأمين",
    },
    thirdPartyName: {
      fr: "Nom du tiers",
      en: "Third Party Name",
      ar: "اسم الطرف الثالث",
    },
    thirdPartyRegistration: {
      fr: "Immatriculation du tiers",
      en: "Third Party Registration",
      ar: "تسجيل الطرف الثالث",
    },
    thirdPartyAgencyCode: {
      fr: "Code agence du tiers",
      en: "Third Party Agency Code",
      ar: "رمز وكالة الطرف الثالث",
    },
    thirdPartyPolicyNumber: {
      fr: "Numéro de police du tiers",
      en: "Third Party Policy Number",
      ar: "رقم بوليصة الطرف الثالث",
    },
    thirdPartyCompany: {
      fr: "Compagnie du tiers",
      en: "Third Party Company",
      ar: "شركة الطرف الثالث",
    },
    vehicleRegistrationPhoto: {
      fr: "Photo Carte Grise *",
      en: "Vehicle Registration Photo *",
      ar: "صورة تسجيل المركبة *",
    },
    declarationPhotoFront: {
      fr: "Photo Déclaration Recto *",
      en: "Declaration Photo (Front) *",
      ar: "صورة الإعلان (الأمامية) *",
    },
    declarationPhotoBack: {
      fr: "Photo Déclaration Verso *",
      en: "Declaration Photo (Back) *",
      ar: "صورة الإعلان (الخلفية) *",
    },
    accidentPhotos: {
      fr: "Photos de l'accident *",
      en: "Accident Photos *",
      ar: "صور الحادث *",
    },
    upload: {
      fr: "Télécharger",
      en: "Upload",
      ar: "تحميل",
    },
    view: {
      fr: "Consulter",
      en: "View",
      ar: "عرض",
    },
    submit: {
      fr: "Soumettre le dossier",
      en: "Submit Case",
      ar: "إرسال الملف",
    },
    fileSelected: {
      fr: "Fichier sélectionné",
      en: "File selected",
      ar: "تم تحديد الملف",
    },
    filesSelected: {
      fr: "fichiers sélectionnés",
      en: "files selected",
      ar: "الملفات المحددة",
    },
    noFileSelected: {
      fr: "Aucun fichier sélectionné",
      en: "No file selected",
      ar: "لم يتم تحديد ملف",
    },
    success: {
      fr: "Dossier créé avec succès",
      en: "Case created successfully",
      ar: "تم إنشاء الملف بنجاح",
    },
    error: {
      fr: "Erreur lors de la création du dossier",
      en: "Error creating case",
      ar: "خطأ في إنشاء الملف",
    },
    validationErrors: {
      fr: "Veuillez corriger les erreurs suivantes :",
      en: "Please correct the following errors:",
      ar: "يرجى تصحيح الأخطاء التالية:",
    },
    requiredFields: {
      fr: "Tous les champs marqués d'un * sont obligatoires",
      en: "All fields marked with * are required",
      ar: "جميع الحقول المميزة بـ * مطلوبة",
    },
    fileRequirements: {
      fr: "Formats acceptés: JPG, JPEG, PNG, PDF (max 10MB)",
      en: "Accepted formats: JPG, JPEG, PNG, PDF (max 10MB)",
      ar: "التنسيقات المقبولة: JPG، JPEG، PNG، PDF (حد أقصى 10 ميجابايت)",
    },
    preview: {
      fr: "Aperçu",
      en: "Preview",
      ar: "معاينة",
    },
    close: {
      fr: "Fermer",
      en: "Close",
      ar: "إغلاق",
    },
    photo: {
      fr: "Photo",
      en: "Photo",
      ar: "صورة",
    },
    previous: {
      fr: "Précédent",
      en: "Previous",
      ar: "السابق",
    },
    next: {
      fr: "Suivant",
      en: "Next",
      ar: "التالي",
    },
  };

  const t_local = (key: string) => {
    return (
      translations[key as keyof typeof translations]?.[
        language as "fr" | "en" | "ar"
      ] || key
    );
  };

  const validateForm = (): boolean => {
    const errors: string[] = [];

    // Check required text fields
    if (!formData.num_sinistre.trim()) {
      errors.push("Numéro de sinistre requis");
    }

    if (!formData.assure_nom.trim()) {
      errors.push("Nom de l'assuré requis");
    }

    if (!formData.agence.trim()) {
      errors.push("Agence requise");
    }

    if (!formData.compagnie.trim()) {
      errors.push("Compagnie requise");
    }
    if (!formData.expert_id) {
      errors.push("Expert requis");
    }

    // Check required files
    if (!formData.carte_grise_photo) {
      errors.push("Photo de la carte grise requise");
    }

    if (!formData.declaration_recto_photo) {
      errors.push("Photo de la déclaration recto requise");
    }

    if (!formData.declaration_verso_photo) {
      errors.push("Photo de la déclaration verso requise");
    }

    if (!formData.photos_accident || formData.photos_accident.length === 0) {
      errors.push("Au moins une photo de l'accident requise");
    }

    // Validate file types and sizes
    const validateFile = (
      file: File | null,
      name: string,
      allowedTypes: string[]
    ) => {
      if (file) {
        if (!allowedTypes.includes(file.type)) {
          errors.push(`${name} doit être au format JPG, PNG ou PDF`);
        }
        if (file.size > 10 * 1024 * 1024) {
          errors.push(`${name} doit faire moins de 10MB`);
        }
      }
    };

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "application/pdf",
    ];
    const imageTypes = ["image/jpeg", "image/jpg", "image/png"];

    validateFile(
      formData.carte_grise_photo ?? null,
      "Photo carte grise",
      allowedTypes
    );
    validateFile(
      formData.declaration_recto_photo ?? null,
      "Photo déclaration recto",
      allowedTypes
    );
    validateFile(
      formData.declaration_verso_photo ?? null,
      "Photo déclaration verso",
      allowedTypes
    );

    // Validate accident photos
    if (formData.photos_accident) {
      formData.photos_accident.forEach((photo, index) => {
        validateFile(photo ?? null, `Photo accident ${index + 1}`, imageTypes);
      });
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange =
    (name: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        if (name === "photos_accident") {
          // Handle multiple files
          const filesArray = Array.from(e.target.files);
          setFormData((prev) => ({ ...prev, [name]: filesArray }));
        } else {
          // Handle single file
          setFormData((prev) => ({
            ...prev,
            [name]: e.target.files?.[0] || null,
          }));
        }
      }
    };

  // Image preview functions
  const handleImagePreview = (file: File | null, title: string) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview({
        isOpen: true,
        src: e.target?.result as string,
        title,
        type: "single",
      });
    };
    reader.readAsDataURL(file);
  };

  const handleMultipleImagePreview = (files: File[] | null, title: string) => {
    if (!files || files.length === 0) return;

    setImagePreview({
      isOpen: true,
      src: "",
      title,
      type: "multiple",
      files,
      currentIndex: 0,
    });

    // Load first image
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview((prev) => ({
        ...prev,
        src: e.target?.result as string,
      }));
    };
    reader.readAsDataURL(files[0]);
  };

  const navigateImage = (direction: "prev" | "next") => {
    if (!imagePreview.files || imagePreview.currentIndex === undefined) return;

    const newIndex =
      direction === "next"
        ? Math.min(imagePreview.currentIndex + 1, imagePreview.files.length - 1)
        : Math.max(imagePreview.currentIndex - 1, 0);

    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview((prev) => ({
        ...prev,
        src: e.target?.result as string,
        currentIndex: newIndex,
      }));
    };
    reader.readAsDataURL(imagePreview.files[newIndex]);
  };

  const closeImagePreview = () => {
    setImagePreview({
      isOpen: false,
      src: "",
      title: "",
      type: "single",
    });
  };

  const parseAndFillFromQR = (qrData: string) => {
    const parts = qrData.split(";");
    if (parts.length < 21) return;
    setFormData((prev) => ({
      ...prev,
      num_sinistre: parts[3] || prev.num_sinistre,
      date_declaration: parts[4]
        ? parts[4].split("-").reverse().join("-")
        : prev.date_declaration,
      date_sinistre: parts[5]
        ? parts[6].split("-").reverse().join("-")
        : prev.date_sinistre,
      assure_nom: parts[7] || prev.assure_nom,
      num_police: parts[8] || prev.num_police,
      tiers_nom: parts[9] || prev.tiers_nom,
      tiers_code_agence: parts[12] || prev.tiers_code_agence,
      tiers_num_police: parts[10] || prev.tiers_num_police,
      tiers_compagnie: parts[11] || prev.tiers_compagnie,
      num_chassis: parts[13] || prev.num_chassis,
      matricule: parts[14] || prev.matricule,
      annee: parts[15] ? Number(parts[15]) : prev.annee,
      categorie: parts[17] || prev.categorie,
      date_debut_assurance: parts[18]
        ? parts[18].split("-").reverse().join("-")
        : prev.date_debut_assurance,
      date_fin_assurance: parts[19]
        ? parts[19].split("-").reverse().join("-")
        : prev.date_fin_assurance,
      tiers_matricule: parts[20] || prev.tiers_matricule,
      compagnie: parts[23]|| prev.compagnie,
    }));
  };

  const handleQRFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setQrScanError(null);
    setQrScanResult(null);
    setQrScanLoading(true);
    const file = e.target.files?.[0];
    if (!file) {
      setQrScanLoading(false);
      return;
    }
    const reader = new FileReader();
    reader.onload = async (ev) => {
      if (qrPreviewRef.current) {
        qrPreviewRef.current.src = ev.target?.result as string;
      }
      try {
        // Dynamically import QrScanner
        const QrScanner = (await import("qr-scanner")).default;
        const result = await QrScanner.scanImage(ev.target?.result as string, {
          returnDetailedScanResult: true,
        });
        setQrScanResult(result.data);
        parseAndFillFromQR(result.data);
      } catch (err: any) {
        setQrScanError(
          t_local("No QR code found. Please try with a clearer image.")
        );
      } finally {
        setQrScanLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setValidationErrors([]);

    // Validate form
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      console.log("Submitting dossier with data:", {
        ...formData,
        carte_grise_photo: formData.carte_grise_photo
          ? `File: ${formData.carte_grise_photo.name}`
          : null,
        declaration_recto_photo: formData.declaration_recto_photo
          ? `File: ${formData.declaration_recto_photo.name}`
          : null,
        declaration_verso_photo: formData.declaration_verso_photo
          ? `File: ${formData.declaration_verso_photo.name}`
          : null,
        photos_accident: formData.photos_accident
          ? `${formData.photos_accident.length} files`
          : null,
      });

      const response = await createDossier(formData);
      console.log("Dossier created successfully:", response);
      setSuccess(true);

      // Navigate to consulter-dossier after a delay
      setTimeout(() => {
        router.push(`/${language}/user/consulter-dossier`);
      }, 2000);
    } catch (err: any) {
      console.error("Error creating dossier:", err);

      // Provide more specific error messages based on error type
      let errorMessage = t_local("error");

      if (err.message) {
        // Use the enhanced error message from createDossier
        errorMessage = err.message;
      } else if (err.response) {
        // Fallback for any unhandled API errors
        const status = err.response.status;
        const data = err.response.data;

        switch (status) {
          case 400:
            errorMessage =
              "Données invalides. Veuillez vérifier les champs requis.";
            break;
          case 401:
            errorMessage = "Session expirée. Veuillez vous reconnecter.";
            break;
          case 403:
            errorMessage =
              "Accès refusé. Vous n'avez pas les permissions nécessaires.";
            break;
          case 413:
            errorMessage =
              "Fichiers trop volumineux. Veuillez réduire la taille des fichiers.";
            break;
          case 422:
            errorMessage =
              "Erreur de validation. Veuillez vérifier vos fichiers et données.";
            if (data?.errors) {
              const fieldErrors = Object.values(data.errors).flat();
              errorMessage += ` Détails: ${fieldErrors.join(", ")}`;
            }
            break;
          case 500:
            errorMessage =
              "Erreur serveur. Veuillez réessayer plus tard ou contacter le support.";
            break;
          default:
            errorMessage = `Erreur ${status}: ${data?.message || "Erreur inconnue"}`;
        }
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <Card>
        <CardHeader>
          <CardTitle>{t_local("title")}</CardTitle>
        </CardHeader>
        <CardContent>
          {/* QR Code Scan Section */}
          <div className="mb-6 p-4 border rounded bg-gray-50">
            <h3 className="text-md font-semibold mb-2">
              Remplissez le formulaire à partir d'un code QR (CAAT)
            </h3>
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1 group hover:ring-2 hover:ring-blue-400 hover:bg-blue-50 transition duration-200 rounded">
                <input
                  type="file"
                  accept="image/*"
                  ref={qrFileInputRef}
                  onChange={handleQRFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  style={{ zIndex: 2 }}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-start hover:bg-blue-600 hover:text-white transition-colors duration-200"
                  onClick={() => qrFileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {t_local("upload")} QR
                </Button>
              </div>
              <img
                ref={qrPreviewRef}
                alt="QR Preview"
                className="max-h-24 rounded border d-none"
                style={{
                  display:
                    qrScanLoading || qrScanResult || qrScanError
                      ? "block"
                      : "none",
                }}
              />
              <div className="flex-1">
                {qrScanLoading && (
                  <div className="text-blue-600">
                    Scanning image for QR code...
                  </div>
                )}
                {qrScanResult && (
                  <div className="text-green-700 font-medium">
                    Code QR Détecté:{" "}
                    <span className="break-all">{qrScanResult}</span>
                  </div>
                )}
                {qrScanError && (
                  <div className="text-red-600">{qrScanError}</div>
                )}
              </div>
            </div>
            <div className="text-xs text-gray-500 mt-2">
              Le QR code doit contenir les informations du dossier. Les champs
              seront remplis automatiquement si le QR est reconnu.
            </div>
          </div>

          {/* TODO: QR Code scanning feature - to be implemented in future release */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Validation Errors */}
            {validationErrors.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-medium mb-2">
                    {t_local("validationErrors")}
                  </div>
                  <ul className="list-disc list-inside space-y-1">
                    {validationErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* Basic Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">{t_local("basicInfo")}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="agence">{t_local("agency")}</Label>
                  <Input
                    id="agence"
                    name="agence"
                    value={formData.agence}
                    onChange={handleInputChange}
                    disabled
                    className="bg-gray-100 cursor-not-allowed"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="code_agence">{t_local("agencyCode")}</Label>
                  <Input
                    id="code_agence"
                    name="code_agence"
                    value={formData.code_agence}
                    onChange={handleInputChange}
                    disabled
                    className="bg-gray-100 cursor-not-allowed"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="num_sinistre">
                    {t_local("claimNumber")} *
                  </Label>
                  <Input
                    id="num_sinistre"
                    name="num_sinistre"
                    value={formData.num_sinistre}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date_sinistre">{t_local("claimDate")}</Label>
                  <Input
                    id="date_sinistre"
                    name="date_sinistre"
                    type="date"
                    value={formData.date_sinistre}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date_declaration">
                    {t_local("declarationDate")}
                  </Label>
                  <Input
                    id="date_declaration"
                    name="date_declaration"
                    type="date"
                    value={formData.date_declaration}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expert_nom">{t_local("expertName")} *</Label>
                  <Select
                    value={formData.expert_id?.toString() || ""}
                    onValueChange={(value) => {
                      const selectedExpert = experts.find(
                        (expert) => expert.id.toString() === value
                      );
                      setFormData((prev) => ({
                        ...prev,
                        expert_id: parseInt(value),
                        expert_nom: selectedExpert?.name || "",
                      }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un expert" />
                    </SelectTrigger>
                    <SelectContent>
                      {experts.map((expert) => (
                        <SelectItem
                          key={expert.id}
                          value={expert.id.toString()}
                        >
                          {expert.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Vehicle Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">{t_local("vehicleInfo")}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="num_chassis">
                    {t_local("chassisNumber")}
                  </Label>
                  <Input
                    id="num_chassis"
                    name="num_chassis"
                    value={formData.num_chassis}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="matricule">
                    {t_local("registrationNumber")}
                  </Label>
                  <Input
                    id="matricule"
                    name="matricule"
                    value={formData.matricule}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="annee">{t_local("year")}</Label>
                  <Input
                    id="annee"
                    name="annee"
                    type="number"
                    value={formData.annee}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="categorie">{t_local("category")}</Label>
                  <Select
                    value={formData.categorie}
                    onValueChange={(value) =>
                      handleSelectChange("categorie", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t_local("category")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LEGER">Léger</SelectItem>
                      <SelectItem value="LOURD">Lourd</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Insurance Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">
                {t_local("insuranceInfo")}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="assure_nom">{t_local("insuredName")} *</Label>
                  <Input
                    id="assure_nom"
                    name="assure_nom"
                    value={formData.assure_nom}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="num_police">{t_local("policyNumber")}</Label>
                  <Input
                    id="num_police"
                    name="num_police"
                    value={formData.num_police}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="compagnie">{t_local("company")}</Label>
                  <Input
                    id="compagnie"
                    name="compagnie"
                    value={formData.compagnie}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date_debut_assurance">
                    {t_local("insuranceStartDate")}
                  </Label>
                  <Input
                    id="date_debut_assurance"
                    name="date_debut_assurance"
                    type="date"
                    value={formData.date_debut_assurance}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date_fin_assurance">
                    {t_local("insuranceEndDate")}
                  </Label>
                  <Input
                    id="date_fin_assurance"
                    name="date_fin_assurance"
                    type="date"
                    value={formData.date_fin_assurance}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            {/* Third Party Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">
                {t_local("thirdPartyInfo")}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tiers_nom">{t_local("thirdPartyName")}</Label>
                  <Input
                    id="tiers_nom"
                    name="tiers_nom"
                    value={formData.tiers_nom}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tiers_matricule">
                    {t_local("thirdPartyRegistration")}
                  </Label>
                  <Input
                    id="tiers_matricule"
                    name="tiers_matricule"
                    value={formData.tiers_matricule}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tiers_code_agence">
                    {t_local("thirdPartyAgencyCode")}
                  </Label>
                  <Input
                    id="tiers_code_agence"
                    name="tiers_code_agence"
                    value={formData.tiers_code_agence}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tiers_num_police">
                    {t_local("thirdPartyPolicyNumber")}
                  </Label>
                  <Input
                    id="tiers_num_police"
                    name="tiers_num_police"
                    value={formData.tiers_num_police}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tiers_compagnie">
                    {t_local("thirdPartyCompany")}
                  </Label>
                  <Input
                    id="tiers_compagnie"
                    name="tiers_compagnie"
                    value={formData.tiers_compagnie}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            {/* Photos Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">{t_local("photos")}</h3>
              <div className="text-sm text-muted-foreground mb-4">
                <p>{t_local("requiredFields")}</p>
                <p>{t_local("fileRequirements")}</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>{t_local("vehicleRegistrationPhoto")}</Label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1 group hover:ring-2 hover:ring-blue-400 hover:bg-blue-50 transition duration-200 rounded">
                      <Input
                        type="file"
                        accept="image/*,.pdf"
                        ref={carteGriseRef}
                        onChange={handleFileChange("carte_grise_photo")}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full justify-start hover:bg-blue-600 hover:text-white transition-colors duration-200"
                        onClick={() => carteGriseRef.current?.click()}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {formData.carte_grise_photo
                          ? t_local("fileSelected")
                          : t_local("upload")}
                      </Button>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={!formData.carte_grise_photo}
                      onClick={() =>
                        handleImagePreview(
                          formData.carte_grise_photo ?? null,
                          t_local("vehicleRegistrationPhoto")
                        )
                      }
                      className="hover:bg-green-600 hover:text-white transition-colors duration-200"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      {t_local("view")}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>{t_local("declarationPhotoFront")}</Label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1 group hover:ring-2 hover:ring-blue-400 hover:bg-blue-50 transition duration-200 rounded">
                      <Input
                        type="file"
                        accept="image/*,.pdf"
                        ref={declarationRectoRef}
                        onChange={handleFileChange("declaration_recto_photo")}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full justify-start hover:bg-blue-600 hover:text-white transition-colors duration-200"
                        onClick={() => declarationRectoRef.current?.click()}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {formData.declaration_recto_photo
                          ? t_local("fileSelected")
                          : t_local("upload")}
                      </Button>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={!formData.declaration_recto_photo}
                      onClick={() =>
                        handleImagePreview(
                          formData.declaration_recto_photo,
                          t_local("declarationPhotoFront")
                        )
                      }
                      className="hover:bg-green-600 hover:text-white transition-colors duration-200"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      {t_local("view")}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>{t_local("declarationPhotoBack")}</Label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1 group hover:ring-2 hover:ring-blue-400 hover:bg-blue-50 transition duration-200 rounded">
                      <Input
                        type="file"
                        accept="image/*,.pdf"
                        ref={declarationVersoRef}
                        onChange={handleFileChange("declaration_verso_photo")}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full justify-start hover:bg-blue-600 hover:text-white transition-colors duration-200"
                        onClick={() => declarationVersoRef.current?.click()}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {formData.declaration_verso_photo
                          ? t_local("fileSelected")
                          : t_local("upload")}
                      </Button>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={!formData.declaration_verso_photo}
                      onClick={() =>
                        handleImagePreview(
                          formData.declaration_verso_photo,
                          t_local("declarationPhotoBack")
                        )
                      }
                      className="hover:bg-green-600 hover:text-white transition-colors duration-200"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      {t_local("view")}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>{t_local("accidentPhotos")}</Label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1 group hover:ring-2 hover:ring-blue-400 hover:bg-blue-50 transition duration-200 rounded">
                      <Input
                        type="file"
                        accept="image/*"
                        multiple
                        ref={photosAccidentRef}
                        onChange={handleFileChange("photos_accident")}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full justify-start hover:bg-blue-600 hover:text-white transition-colors duration-200"
                        onClick={() => photosAccidentRef.current?.click()}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {formData.photos_accident &&
                        formData.photos_accident.length > 0
                          ? `${formData.photos_accident.length} ${t_local("filesSelected")}`
                          : t_local("upload")}
                      </Button>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={
                        !formData.photos_accident ||
                        formData.photos_accident.length === 0
                      }
                      onClick={() =>
                        handleMultipleImagePreview(
                          formData.photos_accident,
                          t_local("accidentPhotos")
                        )
                      }
                      className="hover:bg-green-600 hover:text-white transition-colors duration-200"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      {t_local("view")}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {success && (
              <div className="bg-green-100 text-green-800 p-3 rounded">
                {t_local("success")}
              </div>
            )}
            {error && (
              <div className="bg-red-100 text-red-800 p-3 rounded">{error}</div>
            )}

            <Button
              type="submit"
              className="w-full bg-[#2E8BC0] hover:bg-[#1F3B4D] transition-colors duration-200"
              disabled={loading}
            >
              {loading ? "..." : t_local("submit")}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Image Preview Dialog */}
      <Dialog open={imagePreview.isOpen} onOpenChange={closeImagePreview}>
        <DialogContent className="max-w-4xl max-h-[90vh] bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{imagePreview.title}</span>
              {imagePreview.type === "multiple" && imagePreview.files && (
                <span className="text-sm text-muted-foreground">
                  {(imagePreview.currentIndex || 0) + 1} /{" "}
                  {imagePreview.files.length}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="flex justify-center items-center max-h-[70vh] overflow-auto relative">
            {imagePreview.src && (
              <img
                src={imagePreview.src || "/placeholder.svg"}
                alt={imagePreview.title}
                className="max-w-full max-h-full object-contain"
              />
            )}

            {/* Navigation buttons for multiple images */}
            {imagePreview.type === "multiple" &&
              imagePreview.files &&
              imagePreview.files.length > 1 && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 hover:bg-[#2E8BC0] hover:text-white transition-colors duration-200"
                    onClick={() => navigateImage("prev")}
                    disabled={
                      imagePreview.files &&
                      imagePreview.currentIndex !== undefined
                        ? imagePreview.currentIndex === 0
                        : true
                    }
                  >
                    {t_local("previous")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 hover:bg-[#2E8BC0] hover:text-white transition-colors duration-200"
                    onClick={() => navigateImage("next")}
                    disabled={
                      imagePreview.files &&
                      imagePreview.currentIndex !== undefined
                        ? imagePreview.currentIndex ===
                          imagePreview.files.length - 1
                        : true
                    }
                  >
                    {t_local("next")}
                  </Button>
                </>
              )}
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
