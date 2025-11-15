"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useLanguage } from "@/components/language-provider"
import { Upload, UserPlus } from "lucide-react"
import { createUserAccount, importUsersFromFile } from "@/lib/auth-utils"

export default function UserManagement() {
  const { t, language } = useLanguage()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "user",
  })
  const [file, setFile] = useState<File | null>(null)

  // Translations for this component
  const translations = {
    title: {
      fr: "Gestion des utilisateurs",
      en: "User Management",
      ar: "إدارة المستخدمين",
    },
    createUser: {
      fr: "Créer un utilisateur",
      en: "Create User",
      ar: "إنشاء مستخدم",
    },
    importUsers: {
      fr: "Importer des utilisateurs",
      en: "Import Users",
      ar: "استيراد المستخدمين",
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
    role: {
      fr: "Rôle",
      en: "Role",
      ar: "الدور",
    },
    user: {
      fr: "Utilisateur",
      en: "User",
      ar: "مستخدم",
    },
    admin: {
      fr: "Administrateur",
      en: "Admin",
      ar: "مسؤول",
    },
    submit: {
      fr: "Soumettre",
      en: "Submit",
      ar: "إرسال",
    },
    uploadFile: {
      fr: "Télécharger un fichier",
      en: "Upload File",
      ar: "تحميل ملف",
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
    userCreated: {
      fr: "Utilisateur créé avec succès",
      en: "User created successfully",
      ar: "تم إنشاء المستخدم بنجاح",
    },
    usersImported: {
      fr: "Utilisateurs importés avec succès",
      en: "Users imported successfully",
      ar: "تم استيراد المستخدمين بنجاح",
    },
  }

  const t_local = (key: string) => {
    return translations[key as keyof typeof translations]?.[language] || key
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleRoleChange = (value: string) => {
    setFormData({
      ...formData,
      role: value,
    })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await createUserAccount(formData)
      setSuccess(true)
      setFormData({
        name: "",
        email: "",
        role: "user",
      })

      // Reset success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000)
    } catch (error) {
      console.error("Error creating user:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleImportUsers = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return

    setLoading(true)

    try {
      await importUsersFromFile(file)
      setSuccess(true)
      setFile(null)

      // Reset success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000)
    } catch (error) {
      console.error("Error importing users:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t_local("title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="create">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="create">{t_local("createUser")}</TabsTrigger>
            <TabsTrigger value="import">{t_local("importUsers")}</TabsTrigger>
          </TabsList>

          <TabsContent value="create">
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t_local("name")}</Label>
                <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{t_local("email")}</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">{t_local("role")}</Label>
                <Select value={formData.role} onValueChange={handleRoleChange}>
                  <SelectTrigger>
                    <SelectValue placeholder={t_local("role")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">{t_local("user")}</SelectItem>
                    <SelectItem value="admin">{t_local("admin")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {success && <div className="bg-[#5CB85C] text-white p-2 rounded">{t_local("userCreated")}</div>}

              <Button type="submit" className="w-full bg-[#2E8BC0] hover:bg-[#1F3B4D]" disabled={loading}>
                {loading ? (
                  "..."
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    {t_local("submit")}
                  </>
                )}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="import">
            <form onSubmit={handleImportUsers} className="space-y-4">
              <div className="space-y-2">
                <Label>{t_local("uploadFile")}</Label>
                <div className="relative">
                  <Input
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <Button variant="outline" className="w-full justify-start">
                    <Upload className="h-4 w-4 mr-2" />
                    {file ? file.name : t_local("noFileSelected")}
                  </Button>
                </div>
              </div>

              {success && <div className="bg-[#5CB85C] text-white p-2 rounded">{t_local("usersImported")}</div>}

              <Button type="submit" className="w-full bg-[#2E8BC0] hover:bg-[#1F3B4D]" disabled={loading || !file}>
                {loading ? "..." : t_local("submit")}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
