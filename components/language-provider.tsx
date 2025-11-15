"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"

type Language = "fr" | "en" | "ar"
type Translations = Record<string, Record<Language, string>>

type LanguageContextType = {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

// Comprehensive translations - expanded for the entire app
const translations: Translations = {
  // Login translations
  "login.title": {
    fr: "Connexion",
    en: "Login",
    ar: "تسجيل الدخول",
  },
  "login.email": {
    fr: "Adresse e-mail",
    en: "Email address",
    ar: "عنوان البريد الإلكتروني",
  },
  "login.password": {
    fr: "Mot de passe",
    en: "Password",
    ar: "كلمة المرور",
  },
  "login.submit": {
    fr: "Se connecter",
    en: "Sign in",
    ar: "تسجيل الدخول",
  },
  "login.show_password": {
    fr: "Afficher le mot de passe",
    en: "Show password",
    ar: "إظهار كلمة المرور",
  },
  "login.hide_password": {
    fr: "Masquer le mot de passe",
    en: "Hide password",
    ar: "إخفاء كلمة المرور",
  },
  "login.error_title": {
    fr: "Erreur de connexion",
    en: "Login Error",
    ar: "خطأ في تسجيل الدخول",
  },
  "login.close": {
    fr: "Fermer",
    en: "Close",
    ar: "إغلاق",
  },
  "login.attempting_client": {
    fr: "Tentative de connexion en tant qu'agence...",
    en: "Attempting to login as agency...",
    ar: "محاولة تسجيل الدخول كوكالة...",
  },
  "login.attempting_admin": {
    fr: "Tentative de connexion en tant qu'expert...",
    en: "Attempting to login as expert...",
    ar: "محاولة تسجيل الدخول كخبير...",
  },
  "login.connecting": {
    fr: "Connexion en cours...",
    en: "Connecting...",
    ar: "جاري الاتصال...",
  },
  "login.invalid_credentials": {
    fr: "Identifiants invalides. Veuillez vérifier votre email et mot de passe.",
    en: "Invalid credentials. Please check your email and password.",
    ar: "بيانات اعتماد غير صحيحة. يرجى التحقق من بريدك الإلكتروني وكلمة المرور.",
  },
  "login.profile_error": {
    fr: "Erreur lors de la récupération du profil utilisateur.",
    en: "Error retrieving user profile.",
    ar: "خطأ في استرداد ملف تعريف المستخدم.",
  },

  // Navigation translations
  "nav.dossiers": {
    fr: "Dossiers",
    en: "Cases",
    ar: "الملفات",
  },
  "nav.dossiersClotures": {
    fr: "Dossiers Clôturés",
    en: "Closed Cases",
    ar: "الملفات المغلقة",
  },
  "nav.noteHonoraires": {
    fr: "Note Honoraires",
    en: "Fee Notes",
    ar: "ملاحظات الرسوم",
  },
  "nav.nouveauDossier": {
    fr: "Nouveau Dossier",
    en: "New Case",
    ar: "ملف جديد",
  },
  "nav.consulterDossier": {
    fr: "Consulter Dossier",
    en: "View Case",
    ar: "عرض الملف",
  },
  "nav.contact": {
    fr: "Contact",
    en: "Contact",
    ar: "اتصال",
  },
  "nav.users": {
    fr: "Utilisateurs",
    en: "Users",
    ar: "المستخدمون",
  },

  // Common translations
  "common.logout": {
    fr: "Déconnexion",
    en: "Logout",
    ar: "تسجيل الخروج",
  },
  "common.language": {
    fr: "Langue",
    en: "Language",
    ar: "اللغة",
  },
  "common.loading": {
    fr: "Chargement...",
    en: "Loading...",
    ar: "جاري التحميل...",
  },
  "common.error": {
    fr: "Erreur",
    en: "Error",
    ar: "خطأ",
  },
  "common.success": {
    fr: "Succès",
    en: "Success",
    ar: "نجح",
  },
  "common.cancel": {
    fr: "Annuler",
    en: "Cancel",
    ar: "إلغاء",
  },
  "common.save": {
    fr: "Enregistrer",
    en: "Save",
    ar: "حفظ",
  },
  "common.submit": {
    fr: "Soumettre",
    en: "Submit",
    ar: "إرسال",
  },
  "common.edit": {
    fr: "Modifier",
    en: "Edit",
    ar: "تعديل",
  },
  "common.delete": {
    fr: "Supprimer",
    en: "Delete",
    ar: "حذف",
  },
  "common.view": {
    fr: "Voir",
    en: "View",
    ar: "عرض",
  },
  "common.download": {
    fr: "Télécharger",
    en: "Download",
    ar: "تنزيل",
  },
  "common.upload": {
    fr: "Télécharger",
    en: "Upload",
    ar: "تحميل",
  },
  "common.search": {
    fr: "Rechercher...",
    en: "Search...",
    ar: "بحث...",
  },
  "common.no_data": {
    fr: "Aucune donnée",
    en: "No data",
    ar: "لا توجد بيانات",
  },
  "common.actions": {
    fr: "Actions",
    en: "Actions",
    ar: "إجراءات",
  },
  "common.details": {
    fr: "Détails",
    en: "Details",
    ar: "التفاصيل",
  },
  "common.preview": {
    fr: "Aperçu",
    en: "Preview",
    ar: "معاينة",
  },
  "common.close": {
    fr: "Fermer",
    en: "Close",
    ar: "إغلاق",
  },
  "common.back": {
    fr: "Retour",
    en: "Back",
    ar: "رجوع",
  },
  "common.next": {
    fr: "Suivant",
    en: "Next",
    ar: "التالي",
  },
  "common.previous": {
    fr: "Précédent",
    en: "Previous",
    ar: "السابق",
  },
  "common.required": {
    fr: "Obligatoire",
    en: "Required",
    ar: "مطلوب",
  },
  "common.optional": {
    fr: "Optionnel",
    en: "Optional",
    ar: "اختياري",
  },

  // Landing page translations
  "landing.hero.title": {
    fr: "Expertise Automobile à Distance",
    en: "Remote Car Expertise",
    ar: "خبرة السيارات عن بُعد",
  },
  "landing.hero.subtitle": {
    fr: "Simplifiez vos expertises automobiles grâce à notre plateforme digitale. Gestion des dossiers, communication et suivi en temps réel.",
    en: "Simplify your car expertise with our digital platform. Case management, communication and real-time tracking.",
    ar: "بسّط خبرتك في السيارات من خلال منصتنا الرقمية. إدارة الحالات والتواصل والمتابعة في الوقت الفعلي.",
  },
  "landing.hero.cta": {
    fr: "Commencer",
    en: "Get Started",
    ar: "ابدأ الآن",
  },
  "landing.features.title": {
    fr: "Nos Fonctionnalités",
    en: "Our Features",
    ar: "ميزاتنا",
  },
  "landing.features.digital_expertise": {
    fr: "Expertise Digitale",
    en: "Digital Expertise",
    ar: "الخبرة الرقمية",
  },
  "landing.features.digital_expertise_desc": {
    fr: "Réalisez des expertises à distance grâce à notre plateforme numérique.",
    en: "Perform remote expertise through our digital platform.",
    ar: "قم بإجراء الخبرة عن بُعد من خلال منصتنا الرقمية.",
  },
  "landing.features.data_security": {
    fr: "Sécurité des Données",
    en: "Data Security",
    ar: "أمان البيانات",
  },
  "landing.features.data_security_desc": {
    fr: "Vos données sont sécurisées et conformes aux normes de protection.",
    en: "Your data is secure and compliant with protection standards.",
    ar: "بياناتك آمنة ومتوافقة مع معايير الحماية.",
  },
  "landing.features.case_management": {
    fr: "Gestion des Dossiers",
    en: "Case Management",
    ar: "إدارة الملفات",
  },
  "landing.features.case_management_desc": {
    fr: "Suivez l'état de vos dossiers en temps réel et accédez à l'historique.",
    en: "Track your case status in real-time and access history.",
    ar: "تتبع حالة ملفاتك في الوقت الفعلي والوصول إلى التاريخ.",
  },
  "landing.cta.title": {
    fr: "Prêt à simplifier vos expertises ?",
    en: "Ready to simplify your expertise?",
    ar: "هل أنت مستعد لتبسيط خبرتك؟",
  },
  "landing.cta.subtitle": {
    fr: "Rejoignez notre plateforme et bénéficiez d'un processus d'expertise optimisé.",
    en: "Join our platform and benefit from an optimized expertise process.",
    ar: "انضم إلى منصتنا واستفد من عملية خبرة محسّنة.",
  },
  "landing.cta.button": {
    fr: "Commencer maintenant",
    en: "Start now",
    ar: "ابدأ الآن",
  },
  "landing.footer.rights": {
    fr: "Tous droits réservés",
    en: "All rights reserved",
    ar: "جميع الحقوق محفوظة",
  },
  "landing.footer.description": {
    fr: "Expertise automobile à distance",
    en: "Remote automotive expertise",
    ar: "خبرة السيارات عن بُعد",
  },

  // Status translations
  "status.new": {
    fr: "Nouveau",
    en: "New",
    ar: "جديد",
  },
  "status.in_progress": {
    fr: "En cours",
    en: "In Progress",
    ar: "قيد التقدم",
  },
  "status.ended": {
    fr: "Terminé",
    en: "Ended",
    ar: "منتهي",
  },

  // Form field translations
  "field.name": {
    fr: "Nom",
    en: "Name",
    ar: "الاسم",
  },
  "field.email": {
    fr: "Email",
    en: "Email",
    ar: "البريد الإلكتروني",
  },
  "field.password": {
    fr: "Mot de passe",
    en: "Password",
    ar: "كلمة المرور",
  },
  "field.role": {
    fr: "Rôle",
    en: "Role",
    ar: "الدور",
  },
  "field.code": {
    fr: "Code",
    en: "Code",
    ar: "الرمز",
  },
  "field.agency": {
    fr: "Agence",
    en: "Agency",
    ar: "الوكالة",
  },
  "field.agency_code": {
    fr: "Code agence",
    en: "Agency Code",
    ar: "رمز الوكالة",
  },
  "field.claim_number": {
    fr: "N° Sinistre",
    en: "Claim Number",
    ar: "رقم المطالبة",
  },
  "field.claim_date": {
    fr: "Date du sinistre",
    en: "Claim Date",
    ar: "تاريخ المطالبة",
  },
  "field.declaration_date": {
    fr: "Date de déclaration",
    en: "Declaration Date",
    ar: "تاريخ الإعلان",
  },
  "field.expert_name": {
    fr: "Nom de l'expert",
    en: "Expert Name",
    ar: "اسم الخبير",
  },
  "field.insured_name": {
    fr: "Nom de l'assuré",
    en: "Insured Name",
    ar: "اسم المؤمن عليه",
  },
  "field.policy_number": {
    fr: "N° Police",
    en: "Policy Number",
    ar: "رقم البوليصة",
  },
  "field.company": {
    fr: "Compagnie",
    en: "Company",
    ar: "الشركة",
  },
  "field.chassis_number": {
    fr: "N° Châssis",
    en: "Chassis Number",
    ar: "رقم الهيكل",
  },
  "field.registration_number": {
    fr: "Immatriculation",
    en: "Registration Number",
    ar: "رقم التسجيل",
  },
  "field.year": {
    fr: "Année",
    en: "Year",
    ar: "السنة",
  },
  "field.category": {
    fr: "Catégorie",
    en: "Category",
    ar: "الفئة",
  },
  "field.insurance_start_date": {
    fr: "Date de début d'assurance",
    en: "Insurance Start Date",
    ar: "تاريخ بدء التأمين",
  },
  "field.insurance_end_date": {
    fr: "Date de fin d'assurance",
    en: "Insurance End Date",
    ar: "تاريخ انتهاء التأمين",
  },
  "field.third_party_name": {
    fr: "Nom du tiers",
    en: "Third Party Name",
    ar: "اسم الطرف الثالث",
  },
  "field.third_party_registration": {
    fr: "Immatriculation du tiers",
    en: "Third Party Registration",
    ar: "تسجيل الطرف الثالث",
  },
  "field.third_party_agency_code": {
    fr: "Code agence du tiers",
    en: "Third Party Agency Code",
    ar: "رمز وكالة الطرف الثالث",
  },
  "field.third_party_policy": {
    fr: "N° Police du tiers",
    en: "Third Party Policy Number",
    ar: "رقم بوليصة الطرف الثالث",
  },
  "field.third_party_company": {
    fr: "Compagnie du tiers",
    en: "Third Party Company",
    ar: "شركة الطرف الثالث",
  },
  "field.status": {
    fr: "État",
    en: "Status",
    ar: "الحالة",
  },
  "field.created_at": {
    fr: "Date de création",
    en: "Created Date",
    ar: "تاريخ الإنشاء",
  },
  "field.updated_at": {
    fr: "Dernière mise à jour",
    en: "Last Updated",
    ar: "آخر تحديث",
  },
  "field.closing_date": {
    fr: "Date de clôture",
    en: "Closing Date",
    ar: "تاريخ الإغلاق",
  },

  // Document translations
  "document.vehicle_registration": {
    fr: "Carte Grise",
    en: "Vehicle Registration",
    ar: "تسجيل المركبة",
  },
  "document.declaration_front": {
    fr: "Déclaration Recto",
    en: "Declaration Front",
    ar: "الإعلان الأمامي",
  },
  "document.declaration_back": {
    fr: "Déclaration Verso",
    en: "Declaration Back",
    ar: "الإعلان الخلفي",
  },
  "document.pv": {
    fr: "PV",
    en: "PV",
    ar: "محضر",
  },
  "document.note": {
    fr: "Note",
    en: "Note",
    ar: "ملاحظة",
  },
  "document.accident_photos": {
    fr: "Photos de l'accident",
    en: "Accident Photos",
    ar: "صور الحادث",
  },
  "document.photo": {
    fr: "Photo",
    en: "Photo",
    ar: "صورة",
  },

  // Section titles
  "section.basic_info": {
    fr: "Informations de base",
    en: "Basic Information",
    ar: "المعلومات الأساسية",
  },
  "section.vehicle_info": {
    fr: "Informations du véhicule",
    en: "Vehicle Information",
    ar: "معلومات المركبة",
  },
  "section.insurance_info": {
    fr: "Informations d'assurance",
    en: "Insurance Information",
    ar: "معلومات التأمين",
  },
  "section.third_party_info": {
    fr: "Informations du tiers",
    en: "Third Party Information",
    ar: "معلومات الطرف الثالث",
  },
  "section.documents": {
    fr: "Documents",
    en: "Documents",
    ar: "المستندات",
  },
  "section.photos": {
    fr: "Photos",
    en: "Photos",
    ar: "الصور",
  },

  // User management translations
  "user.admin": {
    fr: "Administrateur",
    en: "Administrator",
    ar: "مدير",
  },
  "user.client": {
    fr: "Client",
    en: "Client",
    ar: "عميل",
  },
  "user.superadmin": {
    fr: "Super Administrateur",
    en: "Super Administrator",
    ar: "مدير متميز",
  },
  "user.create": {
    fr: "Créer un utilisateur",
    en: "Create User",
    ar: "إنشاء مستخدم",
  },
  "user.import": {
    fr: "Importer des utilisateurs",
    en: "Import Users",
    ar: "استيراد المستخدمين",
  },
  "user.management": {
    fr: "Gestion des utilisateurs",
    en: "User Management",
    ar: "إدارة المستخدمين",
  },
  "user.created_success": {
    fr: "Utilisateur créé avec succès",
    en: "User created successfully",
    ar: "تم إنشاء المستخدم بنجاح",
  },
  "user.updated_success": {
    fr: "Utilisateur mis à jour avec succès",
    en: "User updated successfully",
    ar: "تم تحديث المستخدم بنجاح",
  },
  "user.deleted_success": {
    fr: "Utilisateur supprimé avec succès",
    en: "User deleted successfully",
    ar: "تم حذف المستخدم بنجاح",
  },

  // Error messages
  "error.occurred": {
    fr: "Une erreur s'est produite",
    en: "An error occurred",
    ar: "حدث خطأ",
  },
  "error.loading": {
    fr: "Erreur lors du chargement",
    en: "Error loading",
    ar: "خطأ في التحميل",
  },
  "error.saving": {
    fr: "Erreur lors de l'enregistrement",
    en: "Error saving",
    ar: "خطأ في الحفظ",
  },
  "error.deleting": {
    fr: "Erreur lors de la suppression",
    en: "Error deleting",
    ar: "خطأ في الحذف",
  },
  "error.downloading": {
    fr: "Erreur lors du téléchargement",
    en: "Error downloading",
    ar: "خطأ في التنزيل",
  },
  "error.uploading": {
    fr: "Erreur lors du téléchargement",
    en: "Error uploading",
    ar: "خطأ في التحميل",
  },
  "error.network": {
    fr: "Erreur réseau",
    en: "Network error",
    ar: "خطأ في الشبكة",
  },
  "error.validation": {
    fr: "Erreur de validation",
    en: "Validation error",
    ar: "خطأ في التحقق",
  },
  "error.unauthorized": {
    fr: "Non autorisé",
    en: "Unauthorized",
    ar: "غير مخول",
  },
  "error.forbidden": {
    fr: "Accès refusé",
    en: "Access denied",
    ar: "تم رفض الوصول",
  },
  "error.not_found": {
    fr: "Non trouvé",
    en: "Not found",
    ar: "غير موجود",
  },

  // Success messages
  "success.saved": {
    fr: "Enregistré avec succès",
    en: "Saved successfully",
    ar: "تم الحفظ بنجاح",
  },
  "success.updated": {
    fr: "Mis à jour avec succès",
    en: "Updated successfully",
    ar: "تم التحديث بنجاح",
  },
  "success.created": {
    fr: "Créé avec succès",
    en: "Created successfully",
    ar: "تم الإنشاء بنجاح",
  },
  "success.deleted": {
    fr: "Supprimé avec succès",
    en: "Deleted successfully",
    ar: "تم الحذف بنجاح",
  },
  "success.uploaded": {
    fr: "Téléchargé avec succès",
    en: "Uploaded successfully",
    ar: "تم التحميل بنجاح",
  },

  // File handling
  "file.selected": {
    fr: "Fichier sélectionné",
    en: "File selected",
    ar: "تم تحديد الملف",
  },
  "file.no_file_selected": {
    fr: "Aucun fichier sélectionné",
    en: "No file selected",
    ar: "لم يتم تحديد ملف",
  },
  "file.files_selected": {
    fr: "fichiers sélectionnés",
    en: "files selected",
    ar: "الملفات المحددة",
  },
  "file.requirements": {
    fr: "Formats acceptés: JPG, JPEG, PNG, PDF (max 10MB)",
    en: "Accepted formats: JPG, JPEG, PNG, PDF (max 10MB)",
    ar: "التنسيقات المقبولة: JPG، JPEG، PNG، PDF (حد أقصى 10 ميجابايت)",
  },
  "file.requirements_docs": {
    fr: "Formats acceptés: PDF, DOC, DOCX (max 10MB)",
    en: "Accepted formats: PDF, DOC, DOCX (max 10MB)",
    ar: "التنسيقات المقبولة: PDF، DOC، DOCX (حد أقصى 10 ميجابايت)",
  },

  // QR Code
  "qr.scan": {
    fr: "Scanner le code QR",
    en: "Scan QR code",
    ar: "مسح رمز الاستجابة السريعة",
  },
  "qr.scanning": {
    fr: "Scannez le code QR...",
    en: "Scanning QR code...",
    ar: "جاري مسح رمز الاستجابة السريعة...",
  },
  "qr.error": {
    fr: "Erreur lors du scan:",
    en: "Error scanning:",
    ar: "خطأ في المسح:",
  },

  // Contact page
  "contact.title": {
    fr: "Contact",
    en: "Contact",
    ar: "اتصال",
  },
  "contact.subject": {
    fr: "Sujet",
    en: "Subject",
    ar: "الموضوع",
  },
  "contact.message": {
    fr: "Message",
    en: "Message",
    ar: "الرسالة",
  },
  "contact.send": {
    fr: "Envoyer",
    en: "Send",
    ar: "إرسال",
  },
  "contact.message_sent": {
    fr: "Message envoyé avec succès",
    en: "Message sent successfully",
    ar: "تم إرسال الرسالة بنجاح",
  },
  "contact.info": {
    fr: "Informations de contact",
    en: "Contact Information",
    ar: "معلومات الاتصال",
  },
  "contact.expert_email": {
    fr: "Email de l'expert",
    en: "Expert Email",
    ar: "البريد الإلكتروني للخبير",
  },
  "contact.expert_phone": {
    fr: "Téléphone de l'expert",
    en: "Expert Phone",
    ar: "هاتف الخبير",
  },

  // Access denied
  "access.denied_title": {
    fr: "Accès Refusé",
    en: "Access Denied",
    ar: "تم رفض الوصول",
  },
  "access.denied_message": {
    fr: "Vous n'avez pas les autorisations nécessaires pour accéder à cette page.",
    en: "You do not have the necessary permissions to access this page.",
    ar: "ليس لديك الأذونات اللازمة للوصول إلى هذه الصفحة.",
  },
  "access.back_home": {
    fr: "Retour à la page d'accueil",
    en: "Back to home page",
    ar: "العودة إلى الصفحة الرئيسية",
  },

  // 404 page
  "404.title": {
    fr: "Page non trouvée",
    en: "Page not found",
    ar: "الصفحة غير موجودة",
  },
  "404.message": {
    fr: "La page que vous recherchez n'existe pas ou a été déplacée.",
    en: "The page you are looking for does not exist or has been moved.",
    ar: "الصفحة التي تبحث عنها غير موجودة أو تم نقلها.",
  },
  "404.back_home": {
    fr: "Retour à l'accueil",
    en: "Back to home",
    ar: "العودة إلى الرئيسية",
  },

  // Validation messages
  "validation.required_fields": {
    fr: "Tous les champs marqués d'un * sont obligatoires",
    en: "All fields marked with * are required",
    ar: "جميع الحقول المميزة بـ * مطلوبة",
  },
  "validation.correct_errors": {
    fr: "Veuillez corriger les erreurs suivantes :",
    en: "Please correct the following errors:",
    ar: "يرجى تصحيح الأخطاء التالية:",
  },
  "validation.password_required": {
    fr: "Mot de passe requis pour confirmation",
    en: "Password required for confirmation",
    ar: "كلمة المرور مطلوبة للتأكيد",
  },
  "validation.incorrect_password": {
    fr: "Mot de passe incorrect",
    en: "Incorrect password",
    ar: "كلمة مرور غير صحيحة",
  },
  "validation.enter_password": {
    fr: "Entrez votre mot de passe",
    en: "Enter your password",
    ar: "أدخل كلمة المرور الخاصة بك",
  },

  // Confirmation dialogs
  "confirm.delete": {
    fr: "Confirmer la suppression",
    en: "Confirm Deletion",
    ar: "تأكيد الحذف",
  },
  "confirm.delete_message": {
    fr: "Êtes-vous sûr de vouloir supprimer cet élément? Cette action ne peut pas être annulée.",
    en: "Are you sure you want to delete this item? This action cannot be undone.",
    ar: "هل أنت متأكد من رغبتك في حذف هذا العنصر؟ لا يمكن التراجع عن هذا الإجراء.",
  },
  "confirm.proceed": {
    fr: "Continuer",
    en: "Proceed",
    ar: "متابعة",
  },

  // Menu items
  "menu.title": {
    fr: "Menu",
    en: "Menu",
    ar: "القائمة",
  },

  // Coming soon
  coming_soon: {
    fr: "Fonctionnalité à venir",
    en: "Feature coming soon",
    ar: "الميزة قادمة قريباً",
  },

  // No items found
  "no_items.dossiers": {
    fr: "Aucun dossier trouvé",
    en: "No cases found",
    ar: "لم يتم العثور على ملفات",
  },
  "no_items.closed_dossiers": {
    fr: "Aucun dossier clôturé trouvé",
    en: "No closed cases found",
    ar: "لم يتم العثور على ملفات مغلقة",
  },
  "no_items.users": {
    fr: "Aucun utilisateur trouvé",
    en: "No users found",
    ar: "لم يتم العثور على مستخدمين",
  },
  "no_items.admins": {
    fr: "Aucun administrateur trouvé",
    en: "No administrators found",
    ar: "لم يتم العثور على مديرين",
  },
  "no_items.clients": {
    fr: "Aucun client trouvé",
    en: "No clients found",
    ar: "لم يتم العثور على عملاء",
  },
  "no_items.accident_photos": {
    fr: "Aucune photo d'accident disponible",
    en: "No accident photos available",
    ar: "لا توجد صور حوادث متاحة",
  },

  // Categories
  "category.light": {
    fr: "Léger",
    en: "Light",
    ar: "خفيف",
  },
  "category.heavy": {
    fr: "Lourd",
    en: "Heavy",
    ar: "ثقيل",
  },

  // Manual entry
  "manual.enter": {
    fr: "Saisir manuellement",
    en: "Enter manually",
    ar: "أدخل يدوياً",
  },

  // Page titles
  "page.new_case": {
    fr: "Nouveau Dossier",
    en: "New Case",
    ar: "ملف جديد",
  },
  "page.case_details": {
    fr: "Détails du Dossier",
    en: "Case Details",
    ar: "تفاصيل الملف",
  },
  "page.edit_case": {
    fr: "Modifier le dossier",
    en: "Edit Case",
    ar: "تعديل الملف",
  },
  "page.upload_docs": {
    fr: "Télécharger Documents",
    en: "Upload Documents",
    ar: "تحميل المستندات",
  },
  "page.upload_admin_docs": {
    fr: "Télécharger Documents Admin",
    en: "Upload Admin Documents",
    ar: "تحميل مستندات المدير",
  },
  "page.back_to_list": {
    fr: "Retour à la liste",
    en: "Back to list",
    ar: "العودة إلى القائمة",
  },

  // File types
  "file_type.pv_file": {
    fr: "Fichier PV",
    en: "PV File",
    ar: "ملف المحضر",
  },
  "file_type.note_file": {
    fr: "Fichier Note",
    en: "Note File",
    ar: "ملف الملاحظة",
  },
  "file_type.vehicle_registration_photo": {
    fr: "Photo Carte Grise",
    en: "Vehicle Registration Photo",
    ar: "صورة تسجيل المركبة",
  },
  "file_type.declaration_photo_front": {
    fr: "Photo Déclaration Recto",
    en: "Declaration Photo (Front)",
    ar: "صورة الإعلان (الأمامية)",
  },
  "file_type.declaration_photo_back": {
    fr: "Photo Déclaration Verso",
    en: "Declaration Photo (Back)",
    ar: "صورة الإعلان (الخلفية)",
  },

  // Additional status messages
  "status.existing_pv": {
    fr: "PV existant disponible",
    en: "Existing PV available",
    ar: "محضر موجود متاح",
  },
  "status.existing_note": {
    fr: "Note existante disponible",
    en: "Existing note available",
    ar: "ملاحظة موجودة متاحة",
  },
}

const LanguageContext = createContext<LanguageContextType>({
  language: "fr",
  setLanguage: () => {},
  t: (key) => key,
})

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("fr")
  const router = useRouter()
  const pathname = usePathname()

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem("language", lang)

    // In a real app, you might want to update the URL to reflect the language change
    // This is a simplified example
    // const newPath = pathname.replace(/^\/(fr|en|ar)/, `/${lang}`)
    // router.push(newPath)
  }

  useEffect(() => {
    const savedLanguage = localStorage.getItem("language") as Language
    if (savedLanguage && ["fr", "en", "ar"].includes(savedLanguage)) {
      setLanguageState(savedLanguage)
    }
  }, [])

  const t = (key: string): string => {
    return translations[key]?.[language] || key
  }

  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>
}

export const useLanguage = () => useContext(LanguageContext)
