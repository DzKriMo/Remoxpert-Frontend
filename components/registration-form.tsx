"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { UserPlus, CheckCircle, AlertCircle } from "lucide-react"

export default function RegistrationForm() {
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    company: "",
    code: "",
    phone: "",
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      setError("Le nom complet est requis")
      return false
    }
    if (!formData.email.trim()) {
      setError("L'email est requis")
      return false
    }
    if (!formData.company.trim()) {
      setError("L'entreprise est requise")
      return false
    }
    if (!formData.code.trim()) {
      setError("Le code est requis")
      return false
    }
    if (!formData.phone.trim()) {
      setError("Le numéro de téléphone est requis")
      return false
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError("Format d'email invalide")
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(false)

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const response = await fetch(
        "https://remoxpert.com/api/index.php/api/contact",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            client_name: formData.fullName,
            email: formData.email,
            subject: "registration_request",
            message: `Demande d'inscription:
          
Nom: ${formData.fullName}
Email: ${formData.email}
Téléphone: ${formData.phone}
Entreprise: ${formData.company}
Code: ${formData.code}

Cette personne souhaite s'inscrire sur la plateforme Remoxpert.`,
          }),
        }
      );

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de l'inscription")
      }

      setSuccess(true)
      setFormData({
        fullName: "",
        email: "",
        company: "",
        code: "",
        phone: "",
      })
    } catch (error) {
      console.error("Registration error:", error)
      setError(error instanceof Error ? error.message : "Erreur lors de l'inscription")
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      fullName: "",
      email: "",
      company: "",
      code: "",
      phone: "",
    })
    setError("")
    setSuccess(false)
    setLoading(false)
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) {
          resetForm();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button className="w-full bg-[#5CB85C] hover:bg-[#4CAE4C] text-white px-8 py-6 text-lg">
          <UserPlus className="h-5 w-5 mr-2" />
          S'inscrire
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="text-[#1F3B4D]">
            Demande d'inscription
          </DialogTitle>
        </DialogHeader>

        {success ? (
          <div className="text-center py-6">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-green-800 mb-2">
              Inscription envoyée avec succès !
            </h3>
            <p className="text-gray-600 mb-4">
              Nous avons reçu votre demande d'inscription. Notre équipe vous
              contactera dans les 24-48 heures avec vos identifiants de
              connexion.
            </p>
            <p className="text-sm text-gray-500">
              Vous recevrez également un email de confirmation à l'adresse
              fournie.
            </p>
            <Button
              onClick={() => setIsOpen(false)}
              className="mt-4 bg-[#2E8BC0] hover:bg-[#1F3B4D]"
            >
              Fermer
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nom complet *</Label>
              <Input
                id="fullName"
                type="text"
                value={formData.fullName}
                onChange={(e) => handleInputChange("fullName", e.target.value)}
                required
                disabled={loading}
                placeholder="Votre nom complet"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                required
                disabled={loading}
                placeholder="votre@email.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Numéro de téléphone *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                required
                disabled={loading}
                placeholder="+33 1 23 45 67 89"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Entreprise *</Label>
              <Input
                id="company"
                type="text"
                value={formData.company}
                onChange={(e) => handleInputChange("company", e.target.value)}
                required
                disabled={loading}
                placeholder="Nom de votre entreprise"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="code">Code *</Label>
              <Input
                id="code"
                type="text"
                value={formData.code}
                onChange={(e) => handleInputChange("code", e.target.value)}
                required
                disabled={loading}
                placeholder="Code d'accès"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-md flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={loading}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-[#2E8BC0] hover:bg-[#1F3B4D]"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Envoi...
                  </div>
                ) : (
                  "Envoyer la demande"
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
