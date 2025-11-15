"use client";

import type React from "react";

import { useState } from "react";
import DashboardLayout from "@/components/dashboard-layout";
import { useLanguage } from "@/components/language-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { MessageSquare, Send, CheckCircle, AlertCircle } from "lucide-react";

export default function ContactClientPage() {
  const { t, language } = useLanguage();

  const [formData, setFormData] = useState({
    client_name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  /* ----------------- helpers ----------------- */
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError("");

    try {
      const res = await fetch(
        "https://remoxpert.com/api/index.php/api/contact",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to send message");

      setSuccess(true);
      setFormData({ client_name: "", email: "", subject: "", message: "" });
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : "Something went wrong, try again."
      );
    } finally {
      setLoading(false);
    }
  };

  /* ------------- i18n (simple map) ----------- */
  const tLocal = (key: string) =>
    (
      ({
        title: { fr: "Contact", en: "Contact", ar: "اتصال" },
        description: {
          fr: "Contactez-nous pour toute question ou assistance.",
          en: "Contact our team for any questions or assistance.",
          ar: "اتصل بفريقنا لأي أسئلة أو مساعدة.",
        },
        name: { fr: "Nom", en: "Name", ar: "الاسم" },
        email: { fr: "Email", en: "Email", ar: "البريد الإلكتروني" },
        subject: { fr: "Sujet", en: "Subject", ar: "الموضوع" },
        message: { fr: "Message", en: "Message", ar: "الرسالة" },
        send: { fr: "Envoyer", en: "Send", ar: "إرسال" },
        sent: {
          fr: "Message envoyé",
          en: "Message sent",
          ar: "تم الإرسال",
        },
      }) as const
    )[key as keyof typeof translations][language as "fr" | "en" | "ar"];

  const translations = {}; // placeholder – map lives in tLocal

  /* -------------------- UI -------------------- */
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">{tLocal("title")}</h1>
          <p className="text-muted-foreground mt-2">{tLocal("description")}</p>
        </div>

        {success && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>{tLocal("sent")}</AlertTitle>
            <AlertDescription>
              {t("contact_success_description")}
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                {tLocal("title")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="client_name">{tLocal("name")} *</Label>
                    <Input
                      id="client_name"
                      name="client_name"
                      value={formData.client_name}
                      onChange={handleInputChange}
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">{tLocal("email")} *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">{tLocal("subject")} *</Label>
                  <Input
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">{tLocal("message")} *</Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                    rows={6}
                    className="resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-black"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="animate-spin h-4 w-4 border-b-2 border-white rounded-full" />
                      {t("sending") || "Envoi…"}
                    </span>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-1" />
                      SEND
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>contactInfo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium">expertEmail</h3>
                <p>contact@remoxpert.com</p>
              </div>
              <div>
                <h3 className="font-medium">expertPhone</h3>
                <p>+213 661 55 57 12</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
