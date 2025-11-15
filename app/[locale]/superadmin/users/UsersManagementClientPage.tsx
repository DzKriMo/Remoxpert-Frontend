"use client"

import type React from "react"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { useLanguage } from "@/components/language-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog-with-bg"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserPlus, Trash2, Search, AlertCircle } from "lucide-react"
import { userAPI } from "@/lib/api-client"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

type UserType = "admin" | "client"

interface AdminUser {
  id: number
  name: string
  email: string
  is_superadmin: number
  created_at: string
  updated_at: string
}

interface ClientUser {
  id: number
  name: string
  email: string
  code: string
  created_at: string
  updated_at: string
}

export default function UsersManagementClientPage() {
  const { t, language } = useLanguage()
  const [userType, setUserType] = useState<UserType>("admin")
  const [admins, setAdmins] = useState<AdminUser[]>([])
  const [clients, setClients] = useState<ClientUser[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false)
  const [selectedAdminUser, setSelectedAdminUser] = useState<AdminUser | null>(null)
  const [selectedClientUser, setSelectedClientUser] = useState<ClientUser | null>(null)
  const [superAdminPassword, setSuperAdminPassword] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    code: "",
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const [adminResponse, clientResponse] = await Promise.all([userAPI.getAdmins(), userAPI.getClients()])
      setAdmins(adminResponse.data)
      setClients(clientResponse.data)
    } catch (error) {
      console.error("Error fetching users:", error)
      setError("Failed to load users")
    } finally {
      setLoading(false)
    }
  }

  // Translations for this page
  const translations = {
    title: {
      fr: "Gestion des Utilisateurs",
      en: "User Management",
      ar: "إدارة المستخدمين",
    },
    createUser: {
      fr: "Créer un utilisateur",
      en: "Create User",
      ar: "إنشاء مستخدم",
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
    password: {
      fr: "Mot de passe",
      en: "Password",
      ar: "كلمة المرور",
    },
    enterPassword: {
      fr: "Entrez votre mot de passe",
      en: "Enter your password",
      ar: "أدخل كلمة المرور الخاصة بك",
    },
    passwordRequired: {
      fr: "Mot de passe requis pour confirmation",
      en: "Password required for confirmation",
      ar: "كلمة المرور مطلوبة للتأكيد",
    },
    code: {
      fr: "Code",
      en: "Code",
      ar: "الرمز",
    },
    actions: {
      fr: "Actions",
      en: "Actions",
      ar: "إجراءات",
    },
    admins: {
      fr: "Administrateurs",
      en: "Admins",
      ar: "المسؤولون",
    },
    clients: {
      fr: "Clients",
      en: "Clients",
      ar: "العملاء",
    },
    superadmin: {
      fr: "Super Admin",
      en: "Super Admin",
      ar: "مسؤول متميز",
    },
    admin: {
      fr: "Admin",
      en: "Admin",
      ar: "مسؤول",
    },
    search: {
      fr: "Rechercher...",
      en: "Search...",
      ar: "بحث...",
    },
    edit: {
      fr: "Modifier",
      en: "Edit",
      ar: "تعديل",
    },
    delete: {
      fr: "Supprimer",
      en: "Delete",
      ar: "حذف",
    },
    cancel: {
      fr: "Annuler",
      en: "Cancel",
      ar: "إلغاء",
    },
    save: {
      fr: "Enregistrer",
      en: "Save",
      ar: "حفظ",
    },
    confirmDelete: {
      fr: "Confirmer la suppression",
      en: "Confirm Deletion",
      ar: "تأكيد الحذف",
    },
    deleteConfirmation: {
      fr: "Êtes-vous sûr de vouloir supprimer cet utilisateur? Cette action ne peut pas être annulée.",
      en: "Are you sure you want to delete this user? This action cannot be undone.",
      ar: "هل أنت متأكد من رغبتك في حذف هذا المستخدم؟ لا يمكن التراجع عن هذا الإجراء.",
    },
    submit: {
      fr: "Soumettre",
      en: "Submit",
      ar: "إرسال",
    },
    userCreated: {
      fr: "Utilisateur créé avec succès",
      en: "User created successfully",
      ar: "تم إنشاء المستخدم بنجاح",
    },
    userUpdated: {
      fr: "Utilisateur mis à jour avec succès",
      en: "User updated successfully",
      ar: "تم تحديث المستخدم بنجاح",
    },
    userDeleted: {
      fr: "Utilisateur supprimé avec succès",
      en: "User deleted successfully",
      ar: "تم حذف المستخدم بنجاح",
    },
    errorOccurred: {
      fr: "Une erreur s'est produite",
      en: "An error occurred",
      ar: "حدث خطأ",
    },
    incorrectPassword: {
      fr: "Mot de passe incorrect",
      en: "Incorrect password",
      ar: "كلمة مرور غير صحيحة",
    },
    proceed: {
      fr: "Continuer",
      en: "Proceed",
      ar: "متابعة",
    },
  }

  const t_local = (key: string) => {
    return translations[key as keyof typeof translations]?.[language] || key
  }

  // Filter users based on search term
  const filteredAdmins = admins.filter(
    (admin) =>
      admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.code.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleCreateUser = async () => {
    setLoading(true)
    setError("")

    try {
      if (userType === "admin") {
        await userAPI.createAdmin({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        })
      } else {
        await userAPI.createClient({
          name: formData.name,
          email: formData.email,
          code: formData.code,
          password: formData.password,
        })
      }

      setSuccess(true)

      // Refresh user lists
      fetchUsers()

      // Reset form
      setFormData({
        name: "",
        email: "",
        password: "",
        code: "",
      })

      // Close dialog after a delay
      setTimeout(() => {
        setIsCreateDialogOpen(false)
        setSuccess(false)
      }, 1500)
    } catch (error) {
      console.error("Error creating user:", error)
      setError(t_local("errorOccurred"))
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteConfirmation = () => {
    if (!selectedAdminUser && !selectedClientUser) return

    // Open password confirmation dialog
    setIsPasswordDialogOpen(true)
    // Keep delete confirmation dialog open
  }

  const handleDeleteUser = async () => {
    if (!selectedAdminUser && !selectedClientUser) return
    if (!superAdminPassword) {
      setError(t_local("passwordRequired"))
      return
    }

    setLoading(true)
    setError("")

    try {
      const userId = selectedAdminUser ? selectedAdminUser.id.toString() : selectedClientUser!.id.toString()
      const userTypeToDelete = selectedAdminUser ? "admin" : "client"

      // Call the delete user API
      await userAPI.deleteUser({
        password: superAdminPassword,
        user_id: userId,
        user_type: userTypeToDelete as "admin" | "client",
      })

      setSuccess(true)

      // Refresh user lists
      fetchUsers()

      // Close dialogs after a delay
      setTimeout(() => {
        setIsDeleteDialogOpen(false)
        setIsPasswordDialogOpen(false)
        setSuccess(false)
        setSuperAdminPassword("")
      }, 1500)
    } catch (error: any) {
      console.error("Error deleting user:", error)

      // Check if it's an incorrect password error
      if (error.response && error.response.status === 401) {
        setError(t_local("incorrectPassword"))
      } else {
        setError(t_local("errorOccurred"))
      }
    } finally {
      setLoading(false)
    }
  }

  const openCreateDialog = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      code: "",
    })
    setIsCreateDialogOpen(true)
    setError("")
  }

  const openDeleteAdminDialog = (user: AdminUser) => {
    setSelectedAdminUser(user)
    setSelectedClientUser(null)
    setIsDeleteDialogOpen(true)
    setError("")
  }

  const openDeleteClientDialog = (user: ClientUser) => {
    setSelectedClientUser(user)
    setSelectedAdminUser(null)
    setIsDeleteDialogOpen(true)
    setError("")
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">{t_local("title")}</h1>
          <Button onClick={openCreateDialog} className="bg-[#2E8BC0] hover:bg-[#1F3B4D]">
            <UserPlus className="h-4 w-4 mr-2" />
            {t_local("createUser")}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>{t_local("title")}</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t_local("search")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="admin" onValueChange={(value) => setUserType(value as UserType)}>
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="admin">{t_local("admins")}</TabsTrigger>
                <TabsTrigger value="client">{t_local("clients")}</TabsTrigger>
              </TabsList>

              <TabsContent value="admin">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t_local("name")}</TableHead>
                      <TableHead>{t_local("email")}</TableHead>
                      <TableHead>{t_local("role")}</TableHead>
                      <TableHead className="text-right">{t_local("actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAdmins.length > 0 ? (
                      filteredAdmins.map((admin) => (
                        <TableRow key={admin.id}>
                          <TableCell className="font-medium">{admin.name}</TableCell>
                          <TableCell>{admin.email}</TableCell>
                          <TableCell>
                            <Badge
                              className={
                                admin.is_superadmin === 1
                                  ? "bg-purple-100 text-purple-800"
                                  : "bg-blue-100 text-blue-800"
                              }
                            >
                              {admin.is_superadmin === 1 ? t_local("superadmin") : t_local("admin")}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {admin.is_superadmin !== 1 && (
                              <Button variant="ghost" size="sm" onClick={() => openDeleteAdminDialog(admin)}>
                                <Trash2 className="h-4 w-4 text-[#D9534F]" />
                                <span className="sr-only">{t_local("delete")}</span>
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                          {loading ? "Loading..." : "No admins found"}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TabsContent>

              <TabsContent value="client">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t_local("name")}</TableHead>
                      <TableHead>{t_local("email")}</TableHead>
                      <TableHead>{t_local("code")}</TableHead>
                      <TableHead className="text-right">{t_local("actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredClients.length > 0 ? (
                      filteredClients.map((client) => (
                        <TableRow key={client.id}>
                          <TableCell className="font-medium">{client.name}</TableCell>
                          <TableCell>{client.email}</TableCell>
                          <TableCell>{client.code}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" onClick={() => openDeleteClientDialog(client)}>
                              <Trash2 className="h-4 w-4 text-[#D9534F]" />
                              <span className="sr-only">{t_local("delete")}</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                          {loading ? "Loading..." : "No clients found"}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Create User Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t_local("createUser")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Tabs defaultValue="admin" onValueChange={(value) => setUserType(value as UserType)}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="admin">{t_local("admin")}</TabsTrigger>
                <TabsTrigger value="client">{t_local("clients")}</TabsTrigger>
              </TabsList>
            </Tabs>
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
              <Label htmlFor="password">{t_local("password")}</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
            </div>
            {userType === "client" && (
              <div className="space-y-2">
                <Label htmlFor="code">{t_local("code")}</Label>
                <Input id="code" name="code" value={formData.code} onChange={handleInputChange} required />
              </div>
            )}
            {success && <div className="bg-[#5CB85C] text-white p-2 rounded">{t_local("userCreated")}</div>}
            {error && <div className="bg-[#D9534F] text-white p-2 rounded">{error}</div>}
          </div>
          <DialogFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              {t_local("cancel")}
            </Button>
            <Button onClick={handleCreateUser} disabled={loading} className="bg-[#2E8BC0] hover:bg-[#1F3B4D]">
              {loading ? "..." : t_local("save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t_local("confirmDelete")}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>{t_local("deleteConfirmation")}</p>
            <p className="font-medium mt-2">
              {selectedAdminUser
                ? `${selectedAdminUser.name} (${selectedAdminUser.email})`
                : selectedClientUser
                  ? `${selectedClientUser.name} (${selectedClientUser.email})`
                  : ""}
            </p>
          </div>
          <DialogFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              {t_local("cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirmation}
              disabled={loading}
              className="bg-[#D9534F] hover:bg-[#c9302c]"
            >
              {loading ? "..." : t_local("delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Password Confirmation Dialog */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t_local("passwordRequired")}</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="superAdminPassword">{t_local("enterPassword")}</Label>
              <Input
                id="superAdminPassword"
                type="password"
                value={superAdminPassword}
                onChange={(e) => setSuperAdminPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && <div className="bg-[#5CB85C] text-white p-2 rounded">{t_local("userDeleted")}</div>}
          </div>
          <DialogFooter className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsPasswordDialogOpen(false)
                setSuperAdminPassword("")
                setError("")
              }}
            >
              {t_local("cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteUser}
              disabled={loading || !superAdminPassword}
              className="bg-[#D9534F] hover:bg-[#c9302c]"
            >
              {loading ? "..." : t_local("proceed")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
