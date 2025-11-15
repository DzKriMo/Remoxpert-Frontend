"use client";

import type React from "react";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard-layout";
import { useLanguage } from "@/components/language-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MessageSquare,
  Eye,
  Mail,
  Calendar,
  AlertCircle,
  CheckCircle,
  Key,
  EyeOff,
  Trash2,
} from "lucide-react";
import { userAPI } from "@/lib/api-client";

interface ContactMessage {
  id: number;
  client_name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
}

export default function MessagesManagementClientPage() {
  const { t, language } = useLanguage();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Message details dialog
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(
    null
  );
  const [showMessageDialog, setShowMessageDialog] = useState(false);

  // Delete confirmation dialog
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<ContactMessage | null>(
    null
  );
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // Password reset dialog
  const [showPasswordResetDialog, setShowPasswordResetDialog] = useState(false);
  const [passwordResetForm, setPasswordResetForm] = useState({
    target_type: "client" as "client" | "admin",
    target_id: "",
    new_password: "",
    new_password_confirmation: "",
    superadmin_password: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    new: false,
    confirm: false,
    superadmin: false,
  });
  const [passwordResetLoading, setPasswordResetLoading] = useState(false);
  const [passwordResetSuccess, setPasswordResetSuccess] = useState(false);
  const [passwordResetError, setPasswordResetError] = useState("");
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [showAccountCreationDialog, setShowAccountCreationDialog] =
    useState(false);
  const [accountCreationLoading, setAccountCreationLoading] = useState(false);
  const [accountCreationSuccess, setAccountCreationSuccess] = useState(false);
  const [accountCreationError, setAccountCreationError] = useState("");
  const [createdAccountInfo, setCreatedAccountInfo] = useState<{
    name: string;
    email: string;
    password: string;
  } | null>(null);

  const generateSecurePassword = () => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const handleCreateAccount = async (message: ContactMessage) => {
    setAccountCreationLoading(true);
    setAccountCreationError("");
    setAccountCreationSuccess(false);
    setShowAccountCreationDialog(true);

    try {
      const password = generateSecurePassword();
      const response = await userAPI.createClient({
        name: message.client_name,
        email: message.email,
        password: password,
        code: message.message.match(/Code:\s*(\d+)/)?.[1] || "",
      });

      setCreatedAccountInfo({
        name: message.client_name,
        email: message.email,
        password: password,
      });
      setAccountCreationSuccess(true);
    } catch (error) {
      setAccountCreationError("Échec de la création du compte utilisateur");
    } finally {
      setAccountCreationLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No authentication token found");
        return;
      }

      const response = await fetch(
        "https://remoxpert.com/api/index.php/api/contact",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch messages");
      }

      setMessages(data);
    } catch (error) {
      console.error("Messages fetch error:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load messages"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMessage = async () => {
    if (!messageToDelete) return;

    setDeleteLoading(true);
    setDeleteError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        `https://remoxpert.com/api/index.php/api/contact-messages/${messageToDelete.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete message");
      }

      // Remove the deleted message from the state
      setMessages((prevMessages) =>
        prevMessages.filter((msg) => msg.id !== messageToDelete.id)
      );

      // Close the dialog
      setShowDeleteDialog(false);
      setMessageToDelete(null);

      // Show success message (you could also use a toast notification)
      console.log("Message deleted successfully");
    } catch (error) {
      console.error("Delete error:", error);
      setDeleteError(
        error instanceof Error ? error.message : "Failed to delete message"
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  const confirmDelete = (message: ContactMessage) => {
    setMessageToDelete(message);
    setShowDeleteDialog(true);
    setDeleteError("");
  };

  const closeDeleteDialog = () => {
    setShowDeleteDialog(false);
    setMessageToDelete(null);
    setDeleteError("");
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordResetLoading(true);
    setPasswordResetError("");
    setPasswordResetSuccess(false);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        "https://remoxpert.com/api/index.php/api/force-password-reset",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "User-Type": "admin",
          },
          body: JSON.stringify(passwordResetForm),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to reset password");
      }

      setPasswordResetSuccess(true);
      setPasswordResetForm({
        target_type: "client",
        target_id: "",
        new_password: "",
        new_password_confirmation: "",
        superadmin_password: "",
      });

      // Close dialog after 2 seconds
      setTimeout(() => {
        setShowPasswordResetDialog(false);
        setPasswordResetSuccess(false);
      }, 2000);
    } catch (error) {
      console.error("Password reset error:", error);
      setPasswordResetError(
        error instanceof Error ? error.message : "Failed to reset password"
      );
    } finally {
      setPasswordResetLoading(false);
    }
  };

  const togglePasswordVisibility = (
    field: "new" | "confirm" | "superadmin"
  ) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const closePasswordResetDialog = () => {
    setShowPasswordResetDialog(false);
    setPasswordResetForm({
      target_type: "client",
      target_id: "",
      new_password: "",
      new_password_confirmation: "",
      superadmin_password: "",
    });
    setPasswordResetError("");
    setPasswordResetSuccess(false);
    setShowPasswords({ new: false, confirm: false, superadmin: false });
  };

  const getMessagesByType = (type: string) => {
    switch (type) {
      case "password_reset":
        return messages.filter(
          (msg) =>
            msg.subject.toLowerCase().includes("password") ||
            msg.subject.toLowerCase().includes("mot de passe")
        );
      case "registration":
        return messages.filter(
          (msg) =>
            msg.subject.toLowerCase().includes("registration") ||
            msg.subject.toLowerCase().includes("inscription")
        );
      default:
        return messages.filter(
          (msg) =>
            !msg.subject.toLowerCase().includes("password") &&
            !msg.subject.toLowerCase().includes("mot de passe") &&
            !msg.subject.toLowerCase().includes("registration") &&
            !msg.subject.toLowerCase().includes("inscription")
        );
    }
  };

  const getSubjectBadge = (subject: string) => {
    const lowerSubject = subject.toLowerCase();
    if (
      lowerSubject.includes("password") ||
      lowerSubject.includes("mot de passe")
    ) {
      return <Badge variant="destructive">Mot de passe</Badge>;
    }
    if (
      lowerSubject.includes("registration") ||
      lowerSubject.includes("inscription")
    ) {
      return <Badge variant="secondary">Inscription</Badge>;
    }
    return <Badge variant="default">Contact</Badge>;
  };

  const MessageCard = ({ message }: { message: ContactMessage }) => {
    const isRegistration =
      message.subject.toLowerCase().includes("registration") ||
      message.subject.toLowerCase().includes("inscription");

    return (
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">
                {message.client_name || "Anonyme"}
              </h3>
              {getSubjectBadge(message.subject)}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedMessage(message);
                  setShowMessageDialog(true);
                }}
              >
                <Eye className="h-4 w-4 mr-1" />
                Voir
              </Button>
              {isRegistration && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => handleCreateAccount(message)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Créer compte
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => confirmDelete(message)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Supprimer
              </Button>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-1">
            <Mail className="h-3 w-3 inline mr-1" />
            {message.email}
          </p>
          <p className="text-sm text-muted-foreground mb-2">
            <Calendar className="h-3 w-3 inline mr-1" />
            {new Date(message.created_at).toLocaleDateString("fr-FR")}
          </p>
          <p className="font-medium text-sm">{message.subject}</p>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {message.message}
          </p>
        </CardContent>
      </Card>
    );
  };

  const closeAccountCreationDialog = () => {
    setShowAccountCreationDialog(false);
    setAccountCreationSuccess(false);
    setAccountCreationError("");
    setCreatedAccountInfo(null);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
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
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Messages</h1>
            <p className="text-muted-foreground mt-2">
              Gérez les messages et demandes des utilisateurs
            </p>
          </div>
          <Button onClick={() => setShowPasswordResetDialog(true)}>
            <Key className="h-4 w-4 mr-2" />
            Réinitialiser un mot de passe
          </Button>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">Tous ({messages.length})</TabsTrigger>
            <TabsTrigger value="password_reset">
              Mots de passe ({getMessagesByType("password_reset").length})
            </TabsTrigger>
            <TabsTrigger value="registration">
              Inscriptions ({getMessagesByType("registration").length})
            </TabsTrigger>
            <TabsTrigger value="other">
              Autres ({getMessagesByType("other").length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {messages.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Aucun message trouvé</p>
                </CardContent>
              </Card>
            ) : (
              messages.map((message) => (
                <MessageCard key={message.id} message={message} />
              ))
            )}
          </TabsContent>

          <TabsContent value="password_reset" className="space-y-4">
            {getMessagesByType("password_reset").map((message) => (
              <MessageCard key={message.id} message={message} />
            ))}
          </TabsContent>

          <TabsContent value="registration" className="space-y-4">
            {getMessagesByType("registration").map((message) => (
              <MessageCard key={message.id} message={message} />
            ))}
          </TabsContent>

          <TabsContent value="other" className="space-y-4">
            {getMessagesByType("other").map((message) => (
              <MessageCard key={message.id} message={message} />
            ))}
          </TabsContent>
        </Tabs>
      </div>

      {/* Message Details Dialog */}
      <Dialog open={showMessageDialog} onOpenChange={setShowMessageDialog}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Détails du message</DialogTitle>
          </DialogHeader>
          {selectedMessage && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Nom
                  </Label>
                  <p className="font-medium">
                    {selectedMessage.client_name || "Anonyme"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Email
                  </Label>
                  <p className="font-medium">{selectedMessage.email}</p>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Sujet
                </Label>
                <div className="flex items-center gap-2 mt-1">
                  <p className="font-medium">{selectedMessage.subject}</p>
                  {getSubjectBadge(selectedMessage.subject)}
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Date
                </Label>
                <p className="font-medium">
                  {new Date(selectedMessage.created_at).toLocaleString("fr-FR")}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Message
                </Label>
                <div className="bg-muted p-4 rounded-md mt-1">
                  <p className="whitespace-pre-wrap">
                    {selectedMessage.message}
                  </p>
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <Button
                  variant="destructive"
                  onClick={() => {
                    setShowMessageDialog(false);
                    confirmDelete(selectedMessage);
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer ce message
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-4">
              Êtes-vous sûr de vouloir supprimer ce message ? Cette action est
              irréversible.
            </p>
            {messageToDelete && (
              <div className="bg-muted p-3 rounded-md">
                <p className="font-medium text-sm">
                  De: {messageToDelete.client_name || "Anonyme"} (
                  {messageToDelete.email})
                </p>
                <p className="text-sm text-muted-foreground">
                  Sujet: {messageToDelete.subject}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(messageToDelete.created_at).toLocaleString("fr-FR")}
                </p>
              </div>
            )}
            {deleteError && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{deleteError}</AlertDescription>
              </Alert>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={closeDeleteDialog}
              disabled={deleteLoading}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteMessage}
              disabled={deleteLoading}
            >
              {deleteLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Suppression...
                </div>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Password Reset Dialog */}
      <Dialog
        open={showPasswordResetDialog}
        onOpenChange={setShowPasswordResetDialog}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Réinitialiser un mot de passe</DialogTitle>
          </DialogHeader>

          {passwordResetSuccess ? (
            <div className="text-center py-6">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-green-800 mb-2">
                Mot de passe réinitialisé
              </h3>
              <p className="text-gray-600">
                Le mot de passe a été réinitialisé avec succès
              </p>
            </div>
          ) : (
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="target_type">Type d'utilisateur</Label>
                  <select
                    id="target_type"
                    value={passwordResetForm.target_type}
                    onChange={(e) =>
                      setPasswordResetForm((prev) => ({
                        ...prev,
                        target_type: e.target.value as "client" | "admin",
                      }))
                    }
                    className="w-full p-2 border rounded-md"
                    disabled={passwordResetLoading}
                  >
                    <option value="client">Client</option>
                    <option value="admin">Expert</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="target_id">ID utilisateur</Label>
                  <Input
                    id="target_id"
                    type="number"
                    value={passwordResetForm.target_id}
                    onChange={(e) =>
                      setPasswordResetForm((prev) => ({
                        ...prev,
                        target_id: e.target.value,
                      }))
                    }
                    required
                    disabled={passwordResetLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="new_password">Nouveau mot de passe</Label>
                <div className="relative">
                  <Input
                    id="new_password"
                    type={showPasswords.new ? "text" : "password"}
                    value={passwordResetForm.new_password}
                    onChange={(e) =>
                      setPasswordResetForm((prev) => ({
                        ...prev,
                        new_password: e.target.value,
                      }))
                    }
                    required
                    disabled={passwordResetLoading}
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
                  Confirmer le mot de passe
                </Label>
                <div className="relative">
                  <Input
                    id="new_password_confirmation"
                    type={showPasswords.confirm ? "text" : "password"}
                    value={passwordResetForm.new_password_confirmation}
                    onChange={(e) =>
                      setPasswordResetForm((prev) => ({
                        ...prev,
                        new_password_confirmation: e.target.value,
                      }))
                    }
                    required
                    disabled={passwordResetLoading}
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

              <div className="space-y-2">
                <Label htmlFor="superadmin_password">
                  Votre mot de passe (confirmation)
                </Label>
                <div className="relative">
                  <Input
                    id="superadmin_password"
                    type={showPasswords.superadmin ? "text" : "password"}
                    value={passwordResetForm.superadmin_password}
                    onChange={(e) =>
                      setPasswordResetForm((prev) => ({
                        ...prev,
                        superadmin_password: e.target.value,
                      }))
                    }
                    required
                    disabled={passwordResetLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => togglePasswordVisibility("superadmin")}
                  >
                    {showPasswords.superadmin ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {passwordResetError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{passwordResetError}</AlertDescription>
                </Alert>
              )}

              <div className="flex gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closePasswordResetDialog}
                  disabled={passwordResetLoading}
                  className="flex-1"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={passwordResetLoading}
                  className="flex-1"
                >
                  {passwordResetLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Réinitialisation...
                    </div>
                  ) : (
                    "Réinitialiser"
                  )}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Account Creation Dialog */}
      <Dialog
        open={showAccountCreationDialog}
        onOpenChange={setShowAccountCreationDialog}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Création de compte</DialogTitle>
          </DialogHeader>

          {accountCreationLoading ? (
            <div className="text-center py-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">
                Création du compte en cours...
              </p>
            </div>
          ) : accountCreationSuccess && createdAccountInfo ? (
            <div className="space-y-4">
              <div className="text-center py-4">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-green-800 mb-2">
                  Compte créé avec succès!
                </h3>
              </div>

              <div className="space-y-3 bg-muted p-4 rounded-md">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Nom
                  </Label>
                  <p className="font-medium">{createdAccountInfo.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Email
                  </Label>
                  <p className="font-medium">{createdAccountInfo.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Mot de passe généré
                  </Label>
                  <p className="font-mono text-sm bg-background p-2 rounded border">
                    {createdAccountInfo.password}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={closeAccountCreationDialog}
                  className="flex-1"
                >
                  Fermer
                </Button>
                <Button asChild className="flex-1">
                  <a
                    href={`mailto:${createdAccountInfo.email}?subject=Votre compte a été créé&body=Bonjour ${createdAccountInfo.name},%0D%0A%0D%0AVotre compte a été créé avec succès.%0D%0A%0D%0AInformations de connexion:%0D%0AEmail: ${createdAccountInfo.email}%0D%0AMot de passe: ${createdAccountInfo.password}%0D%0A%0D%0ACordialement`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Envoyer par email
                  </a>
                </Button>
              </div>
            </div>
          ) : accountCreationError ? (
            <div className="text-center py-6">
              <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-800 mb-2">
                Erreur lors de la création
              </h3>
              <p className="text-muted-foreground mb-4">
                {accountCreationError}
              </p>
              <Button onClick={closeAccountCreationDialog} variant="outline">
                Fermer
              </Button>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
