"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/components/language-provider";
import LanguageSwitcher from "@/components/language-switcher";
import { authAPI } from "@/lib/api-client";
import { Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type UserType = "admin" | "client";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [loginAttempt, setLoginAttempt] = useState<"none" | "admin" | "client">(
    "none"
  );

  // Forgot password state
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [forgotPasswordName, setForgotPasswordName] = useState("");
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState("");
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState(false);
  const [forgotPasswordError, setForgotPasswordError] = useState("");

  const router = useRouter();
  const { t, language } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setShowErrorDialog(false);

    // First attempt: try client login (since it's more likely to succeed)
    setLoginAttempt("client");
    let clientSuccess = false;

    try {
      const clientResponse = await authAPI.login(email, password, "client");
      await handleSuccessfulLogin(clientResponse.data);
      clientSuccess = true;
      return; // Exit if client login succeeds
    } catch (clientError) {
      console.log("Client login failed, trying admin login");

      // Don't show error yet, try admin login first
    } finally {
      // Only proceed to admin login if client login failed
      if (!clientSuccess) {
        // Second attempt: try admin login
        setLoginAttempt("admin");

        try {
          const adminResponse = await authAPI.login(email, password, "admin");
          await handleSuccessfulLogin(adminResponse.data);
          return; // Exit if admin login succeeds
        } catch (adminError) {
          console.error("Both login attempts failed");

          // Both login attempts failed, show error dialog
          setError(
            "Identifiants invalides. Veuillez vérifier votre email et mot de passe."
          );
          setShowErrorDialog(true);
        } finally {
          setLoading(false);
          setLoginAttempt("none");
        }
      }
    }
  };

  const handleSuccessfulLogin = async (data: any) => {
    const { access_token, token_type, user_type, expires_in } = data;

    // Store token, user type and timestamp in local storage
    localStorage.setItem("token", access_token);
    localStorage.setItem("userType", user_type);
    localStorage.setItem("tokenTimestamp", Date.now().toString());

    // Also set token as a cookie for server-side access
    document.cookie = `token=${access_token}; path=/; max-age=${expires_in}; SameSite=Strict`;
    document.cookie = `userType=${user_type}; path=/; max-age=${expires_in}; SameSite=Strict`;

    try {
      // Fetch user profile info
      const userResponse = await authAPI.getProfile();
      const userData = userResponse.data;

      localStorage.setItem("user", JSON.stringify(userData));

      // Fix: Check for superadmin properly - handle different data types
      const isSuperAdminValue =
        userData.is_superadmin === 1 ||
        userData.is_superadmin === "1" ||
        userData.is_superadmin === true ||
        userData.is_superadmin === "true";

      if (isSuperAdminValue) {
        localStorage.setItem("isSuperAdmin", "true");
        document.cookie = `isSuperAdmin=true; path=/; max-age=${expires_in}; SameSite=Strict`;
      }

      console.log("User data:", userData);
      console.log("Is superadmin:", isSuperAdminValue);
      console.log(
        "Raw is_superadmin value:",
        userData.is_superadmin,
        typeof userData.is_superadmin
      );

      // Fix: Use the boolean value instead of string comparison
      if (user_type === "admin") {
        if (isSuperAdminValue) {
          router.push(`/${language}/superadmin/dashboard`);
        } else {
          router.push(`/${language}/admin/dashboard`);
        }
      } else {
        router.push(`/${language}/user/dashboard`);
      }
    } catch (profileError) {
      console.error("Error fetching user profile:", profileError);
      setError("Erreur lors de la récupération du profil utilisateur.");
      setShowErrorDialog(true);
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotPasswordLoading(true);
    setForgotPasswordError("");
    setForgotPasswordSuccess(false);

    try {
      const response = await fetch(
        "https://remoxpert.com/api/index.php/api/password-reset-request",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "User-Type": "admin",
          },
          body: JSON.stringify({
            email: forgotPasswordEmail,
            client_name: forgotPasswordName,
            message:
              forgotPasswordMessage ||
              "Demande de réinitialisation de mot de passe",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de l'envoi de la demande");
      }

      setForgotPasswordSuccess(true);
      setForgotPasswordEmail("");
      setForgotPasswordName("");
      setForgotPasswordMessage("");
    } catch (error) {
      console.error("Forgot password error:", error);
      setForgotPasswordError(
        error instanceof Error
          ? error.message
          : "Erreur lors de l'envoi de la demande"
      );
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  const closeErrorDialog = () => {
    setShowErrorDialog(false);
    setError("");
  };

  const closeForgotPasswordDialog = () => {
    setShowForgotPassword(false);
    setForgotPasswordEmail("");
    setForgotPasswordName("");
    setForgotPasswordMessage("");
    setForgotPasswordError("");
    setForgotPasswordSuccess(false);
  };

  // Translations for show/hide password
  const passwordVisibilityText = {
    show: {
      fr: "Afficher le mot de passe",
      en: "Show password",
      ar: "إظهار كلمة المرور",
    },
    hide: {
      fr: "Masquer le mot de passe",
      en: "Hide password",
      ar: "إخفاء كلمة المرور",
    },
  };

  const getPasswordVisibilityText = (key: "show" | "hide") => {
    return (
      passwordVisibilityText[key][language as "fr" | "en" | "ar"] ||
      passwordVisibilityText[key]["en"]
    );
  };

  // Translations for error dialog
  const errorDialogTranslations = {
    title: {
      fr: "Erreur de connexion",
      en: "Login Error",
      ar: "خطأ في تسجيل الدخول",
    },
    close: {
      fr: "Fermer",
      en: "Close",
      ar: "إغلاق",
    },
    forgotPassword: {
      fr: "Mot de passe oublié ?",
      en: "Forgot password?",
      ar: "نسيت كلمة المرور؟",
    },
    forgotPasswordTitle: {
      fr: "Réinitialisation du mot de passe",
      en: "Password Reset",
      ar: "إعادة تعيين كلمة المرور",
    },
    forgotPasswordDescription: {
      fr: "Entrez votre email pour demander une réinitialisation de mot de passe",
      en: "Enter your email to request a password reset",
      ar: "أدخل بريدك الإلكتروني لطلب إعادة تعيين كلمة المرور",
    },
    name: {
      fr: "Nom (optionnel)",
      en: "Name (optional)",
      ar: "الاسم (اختياري)",
    },
    additionalMessage: {
      fr: "Message supplémentaire (optionnel)",
      en: "Additional message (optional)",
      ar: "رسالة إضافية (اختيارية)",
    },
    sendRequest: {
      fr: "Envoyer la demande",
      en: "Send Request",
      ar: "إرسال الطلب",
    },
    requestSent: {
      fr: "Demande envoyée avec succès",
      en: "Request sent successfully",
      ar: "تم إرسال الطلب بنجاح",
    },
    requestSentDescription: {
      fr: "Votre demande de réinitialisation a été envoyée. Un administrateur vous contactera bientôt.",
      en: "Your reset request has been sent. An administrator will contact you soon.",
      ar: "تم إرسال طلب إعادة التعيين. سيتواصل معك المسؤول قريباً.",
    },
  };

  const getErrorDialogText = (key: string) => {
    return (
      errorDialogTranslations[key as keyof typeof errorDialogTranslations]?.[
        language as "fr" | "en" | "ar"
      ] ||
      errorDialogTranslations[key as keyof typeof errorDialogTranslations]?.[
        "fr"
      ]
    );
  };

  return (
    <>
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="bg-[#1F3B4D] text-white relative">
          <div className="absolute right-4 top-4">
            <LanguageSwitcher />
          </div>
          <CardTitle className="text-2xl">{t("login.title")}</CardTitle>
          <CardDescription className="text-gray-300">
            ExpertAuto - Expertise Automobile à Distance
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 pt-6">
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className={language === "ar" ? "text-right block" : ""}
              >
                {t("login.email")}
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-[#1F3B4D]"
                dir={language === "ar" ? "rtl" : "ltr"}
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="password"
                className={language === "ar" ? "text-right block" : ""}
              >
                {t("login.password")}
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="border-[#1F3B4D] pr-10"
                  dir={language === "ar" ? "rtl" : "ltr"}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={
                    showPassword
                      ? getPasswordVisibilityText("hide")
                      : getPasswordVisibilityText("show")
                  }
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <Button
                type="button"
                variant="link"
                className="text-sm text-[#2E8BC0] hover:text-[#1F3B4D] p-0"
                onClick={() => setShowForgotPassword(true)}
              >
                {getErrorDialogText("forgotPassword")}
              </Button>
            </div>

            {loginAttempt !== "none" && (
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#2E8BC0]"></div>
                {loginAttempt === "admin"
                  ? "Tentative de connexion en tant qu'expert..."
                  : "Tentative de connexion en tant qu'agence..."}
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              className="w-full bg-[#2E8BC0] hover:bg-[#1F3B4D]"
              disabled={loading}
            >
              {loading ? "Connexion en cours..." : t("login.submit")}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Error Dialog */}
      <Dialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              {getErrorDialogText("title")}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-700">{error}</p>
          </div>
          <div className="flex justify-end">
            <Button
              onClick={closeErrorDialog}
              className="bg-[#2E8BC0] hover:bg-[#1F3B4D]"
            >
              {getErrorDialogText("close")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Forgot Password Dialog */}
      <Dialog open={showForgotPassword} onOpenChange={setShowForgotPassword}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {getErrorDialogText("forgotPasswordTitle")}
            </DialogTitle>
          </DialogHeader>

          {forgotPasswordSuccess ? (
            <div className="text-center py-6">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-green-800 mb-2">
                {getErrorDialogText("requestSent")}
              </h3>
              <p className="text-gray-600 mb-4">
                {getErrorDialogText("requestSentDescription")}
              </p>
              <Button
                onClick={closeForgotPasswordDialog}
                className="bg-[#2E8BC0] hover:bg-[#1F3B4D]"
              >
                {getErrorDialogText("close")}
              </Button>
            </div>
          ) : (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <p className="text-sm text-gray-600">
                {getErrorDialogText("forgotPasswordDescription")}
              </p>

              <div className="space-y-2">
                <Label htmlFor="forgotEmail">{t("login.email")}</Label>
                <Input
                  id="forgotEmail"
                  type="email"
                  value={forgotPasswordEmail}
                  onChange={(e) => setForgotPasswordEmail(e.target.value)}
                  required
                  disabled={forgotPasswordLoading}
                  placeholder="votre@email.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="forgotName">{getErrorDialogText("name")}</Label>
                <Input
                  id="forgotName"
                  type="text"
                  value={forgotPasswordName}
                  onChange={(e) => setForgotPasswordName(e.target.value)}
                  disabled={forgotPasswordLoading}
                  placeholder="Votre nom"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="forgotMessage">
                  {getErrorDialogText("additionalMessage")}
                </Label>
                <Input
                  id="forgotMessage"
                  type="text"
                  value={forgotPasswordMessage}
                  onChange={(e) => setForgotPasswordMessage(e.target.value)}
                  disabled={forgotPasswordLoading}
                  placeholder="Message supplémentaire..."
                />
              </div>

              {forgotPasswordError && (
                <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-md flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {forgotPasswordError}
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeForgotPasswordDialog}
                  disabled={forgotPasswordLoading}
                  className="flex-1"
                >
                  {getErrorDialogText("close")}
                </Button>
                <Button
                  type="submit"
                  disabled={forgotPasswordLoading}
                  className="flex-1 bg-[#2E8BC0] hover:bg-[#1F3B4D]"
                >
                  {forgotPasswordLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Envoi...
                    </div>
                  ) : (
                    getErrorDialogText("sendRequest")
                  )}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
