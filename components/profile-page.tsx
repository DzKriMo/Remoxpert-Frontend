"use client"

import type React from "react"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { useLanguage } from "@/components/language-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { User, Lock, Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react"

interface UserProfile {
  id: number
  name: string
  email: string
  phone?: string
  company?: string
  is_superadmin?: number
  created_at: string
}

interface ProfilePageProps {
  userType: "client" | "admin"
}

export default function ProfilePage({ userType }: ProfilePageProps) {
  const { t, language } = useLanguage()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // Password change state
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    old_password: "",
    new_password: "",
    new_password_confirmation: "",
  })
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false,
  })
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [passwordError, setPasswordError] = useState("")

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        setError("No authentication token found")
        return
      }

      const response = await fetch(
        "https://remoxpert.com/api/index.php/api/me",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "User-Type": userType,
          },
        }
      );

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch profile")
      }

      setProfile(data)
    } catch (error) {
      console.error("Profile fetch error:", error)
      setError(error instanceof Error ? error.message : "Failed to load profile")
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordLoading(true)
    setPasswordError("")
    setPasswordSuccess(false)

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("No authentication token found")
      }

      const response = await fetch(
        "https://remoxpert.com/api/index.php/api/change-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "User-Type": userType,
          },
          body: JSON.stringify(passwordForm),
        }
      );

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to change password")
      }

      setPasswordSuccess(true)
      setPasswordForm({
        old_password: "",
        new_password: "",
        new_password_confirmation: "",
      })

      // Close dialog after 2 seconds
      setTimeout(() => {
        setShowPasswordDialog(false)
        setPasswordSuccess(false)
      }, 2000)
    } catch (error) {
      console.error("Password change error:", error)
      setPasswordError(error instanceof Error ? error.message : "Failed to change password")
    } finally {
      setPasswordLoading(false)
    }
  }

  const togglePasswordVisibility = (field: "old" | "new" | "confirm") => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }))
  }

  const closePasswordDialog = () => {
    setShowPasswordDialog(false)
    setPasswordForm({
      old_password: "",
      new_password: "",
      new_password_confirmation: "",
    })
    setPasswordError("")
    setPasswordSuccess(false)
    setShowPasswords({ old: false, new: false, confirm: false })
  }

  // Translations
  const translations = {
    title: {
      fr: "Profil",
      en: "Profile",
      ar: "الملف الشخصي",
    },
    personalInfo: {
      fr: "Informations personnelles",
      en: "Personal Information",
      ar: "المعلومات الشخصية",
    },
    name: {
      fr: "Nom",
      en: "Name",
      ar: "الاسم",
    },
    email: {
      fr: "Email",
      en: "Email",
      ar: "البريد الإلكتروني",
    },
    phone: {
      fr: "Téléphone",
      en: "Phone",
      ar: "الهاتف",
    },
    company: {
      fr: "Entreprise",
      en: "Company",
      ar: "الشركة",
    },
    role: {
      fr: "Rôle",
      en: "Role",
      ar: "الدور",
    },
    memberSince: {
      fr: "Membre depuis",
      en: "Member since",
      ar: "عضو منذ",
    },
    changePassword: {
      fr: "Changer le mot de passe",
      en: "Change Password",
      ar: "تغيير كلمة المرور",
    },
    oldPassword: {
      fr: "Ancien mot de passe",
      en: "Old Password",
      ar: "كلمة المرور القديمة",
    },
    newPassword: {
      fr: "Nouveau mot de passe",
      en: "New Password",
      ar: "كلمة المرور الجديدة",
    },
    confirmPassword: {
      fr: "Confirmer le mot de passe",
      en: "Confirm Password",
      ar: "تأكيد كلمة المرور",
    },
    save: {
      fr: "Enregistrer",
      en: "Save",
      ar: "حفظ",
    },
    cancel: {
      fr: "Annuler",
      en: "Cancel",
      ar: "إلغاء",
    },
    passwordChanged: {
      fr: "Mot de passe modifié",
      en: "Password Changed",
      ar: "تم تغيير كلمة المرور",
    },
    passwordChangedDesc: {
      fr: "Votre mot de passe a été modifié avec succès",
      en: "Your password has been changed successfully",
      ar: "تم تغيير كلمة المرور بنجاح",
    },
  }

  const tLocal = (key: string) => {
    return translations[key as keyof typeof translations]?.[language as "fr" | "en" | "ar"] || key
  }

  const getRoleText = () => {
    if (profile?.is_superadmin === 1) return "Super Administrateur"
    if (userType === "admin") return "Expert"
    return "Client"
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">{tLocal("title")}</h1>
          <p className="text-muted-foreground mt-2">
            Gérez vos informations personnelles et paramètres
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Profile Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                {tLocal("personalInfo")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  {tLocal("name")}
                </Label>
                <p className="font-medium">{profile?.name || "N/A"}</p>
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  {tLocal("email")}
                </Label>
                <p className="font-medium">{profile?.email || "N/A"}</p>
              </div>

              {profile?.phone && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    {tLocal("phone")}
                  </Label>
                  <p className="font-medium">{profile.phone}</p>
                </div>
              )}

              {profile?.company && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    {tLocal("company")}
                  </Label>
                  <p className="font-medium">{profile.company}</p>
                </div>
              )}

              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  {tLocal("role")}
                </Label>
                <p className="font-medium">{getRoleText()}</p>
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  {tLocal("memberSince")}
                </Label>
                <p className="font-medium">
                  {profile?.created_at
                    ? new Date(profile.created_at).toLocaleDateString("fr-FR")
                    : "N/A"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" />
                Sécurité
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Modifiez votre mot de passe pour sécuriser votre compte
                </p>
                <Button
                  className="bg-[#1f3b4d] hover:bg-[#1f3b4d]/90 text-white w-full"
                  onClick={() => setShowPasswordDialog(true)}
                >
                  <Lock className="h-4 w-4 mr-2" />
                  Change Password
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Change Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{tLocal("changePassword")}</DialogTitle>
          </DialogHeader>

          {passwordSuccess ? (
            <div className="text-center py-6">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-green-800 mb-2">
                {tLocal("passwordChanged")}
              </h3>
              <p className="text-gray-600">{tLocal("passwordChangedDesc")}</p>
            </div>
          ) : (
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="old_password">{tLocal("oldPassword")}</Label>
                <div className="relative">
                  <Input
                    id="old_password"
                    type={showPasswords.old ? "text" : "password"}
                    value={passwordForm.old_password}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        old_password: e.target.value,
                      }))
                    }
                    required
                    disabled={passwordLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => togglePasswordVisibility("old")}
                  >
                    {showPasswords.old ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="new_password">{tLocal("newPassword")}</Label>
                <div className="relative">
                  <Input
                    id="new_password"
                    type={showPasswords.new ? "text" : "password"}
                    value={passwordForm.new_password}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        new_password: e.target.value,
                      }))
                    }
                    required
                    disabled={passwordLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => togglePasswordVisibility("new")}
                  >
                    {showPasswords.new ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="new_password_confirmation">
                  {tLocal("confirmPassword")}
                </Label>
                <div className="relative">
                  <Input
                    id="new_password_confirmation"
                    type={showPasswords.confirm ? "text" : "password"}
                    value={passwordForm.new_password_confirmation}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        new_password_confirmation: e.target.value,
                      }))
                    }
                    required
                    disabled={passwordLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => togglePasswordVisibility("confirm")}
                  >
                    {showPasswords.confirm ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {passwordError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{passwordError}</AlertDescription>
                </Alert>
              )}

              <div className="flex gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closePasswordDialog}
                  disabled={passwordLoading}
                  className="flex-1"
                >
                  {tLocal("cancel")}
                </Button>
                <Button
                  type="submit"
                  disabled={passwordLoading}
                  className="flex-1 bg-[#1f3b4d] hover:bg-[#1f3b4d]/90 text-white w-full"
                >
                  {passwordLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Enregistrement...
                    </div>
                  ) : (
                    tLocal("save")
                  )}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
