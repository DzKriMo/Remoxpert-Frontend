"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import DashboardStats from "@/components/dashboard-stats"
import { useLanguage } from "@/components/language-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Shield, Activity, TrendingUp, AlertCircle, Briefcase, CheckSquare, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { apiClient } from "@/lib/api-client"

interface SystemStats {
  users: {
    total_users: number
    total_clients: number
    total_admins: number
    active_admins_last_7_days: number
    inactive_admins: number
  }
  growth: {
    new_clients: {
      last_7_days: number
      last_30_days: number
      growth_rate_monthly: number
    }
    new_dossiers: {
      last_7_days: number
      last_30_days: number
    }
  }
  activity: {
    dossiers: {
      total: number
      active: number
      completed: number
      rejected: number
      completion_rate: number
      rejection_rate: number
    }
    average_completion_time: number
  }
  updated_at: string
}

export default function SuperAdminDashboard() {
  const router = useRouter()
  const { t } = useLanguage()
  const [loading, setLoading] = useState(true)
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check authentication and superadmin status
    const token = localStorage.getItem("token")
    const userType = localStorage.getItem("userType")
    const isSuperAdmin = localStorage.getItem("isSuperAdmin")

    if (!token || userType !== "admin" || isSuperAdmin !== "true") {
      router.push("/login")
      return
    }

    fetchSystemStats()
  }, [router])

  const fetchSystemStats = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await apiClient.get("/system/stats")
      setSystemStats(response.data)
    } catch (err: any) {
      console.error("Error fetching system stats:", err)
      setError(`Erreur de chargement: ${err.message || "Erreur inconnue"}`)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout userType="admin">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2E8BC0]"></div>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout userType="admin">
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 mb-2 font-semibold">{error}</p>
              <p className="text-sm text-gray-500 mb-4">Vérifiez votre connexion et réessayez</p>
              <Button onClick={fetchSystemStats} className="mt-4 bg-red-600 hover:bg-red-700">
                Réessayer
              </Button>
            </div>
          </CardContent>
        </Card>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-[#1F3B4D]">Tableau de Bord Super Admin</h1>
          <p className="text-gray-600 mt-2">Vue d'ensemble de la plateforme ExpertAuto</p>
        </div>

        {/* System Overview Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-white to-purple-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Utilisateurs</CardTitle>
              <Users className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{systemStats?.users.total_users || 0}</div>
              <p className="text-xs text-muted-foreground">Tous les utilisateurs</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-indigo-500 hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-white to-indigo-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Admins Actifs</CardTitle>
              <Shield className="h-4 w-4 text-indigo-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-indigo-600">
                {systemStats?.users.active_admins_last_7_days || 0}
              </div>
              <p className="text-xs text-muted-foreground">Actifs (7 derniers jours)</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-white to-green-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Nouveaux Clients</CardTitle>
              <Activity className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {systemStats?.growth.new_clients.last_7_days || 0}
              </div>
              <p className="text-xs text-muted-foreground">Cette semaine</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500 hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-white to-orange-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Croissance</CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {systemStats?.growth.new_clients.growth_rate_monthly || 0}%
              </div>
              <p className="text-xs text-muted-foreground">Croissance mensuelle</p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Statistics */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader>
              <CardTitle className="text-[#1F3B4D]">Gestion des Utilisateurs</CardTitle>
              <CardDescription>Répartition et activité des utilisateurs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Total Clients</span>
                <span className="text-sm font-medium text-blue-600">{systemStats?.users.total_clients || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Total Admins</span>
                <span className="text-sm font-medium text-indigo-600">{systemStats?.users.total_admins || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Admins Inactifs</span>
                <span className="text-sm font-medium text-gray-600">{systemStats?.users.inactive_admins || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Nouveaux (30 jours)</span>
                <span className="text-sm font-medium text-green-600">
                  {systemStats?.growth.new_clients.last_30_days || 0}
                </span>
              </div>
            </CardContent>
          </Card>

   <Card className="border-l-4 border-l-green-500">
            <CardHeader>
              <CardTitle className="text-[#1F3B4D]">Activité Dossiers</CardTitle>
              <CardDescription>Performance et métriques des dossiers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Total Dossiers</span>
                <span className="text-sm font-medium text-[#2E8BC0]">{systemStats?.activity.dossiers.total || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Dossiers complété</span>
                <span className="text-sm font-medium text-yellow-600">
                  {systemStats?.activity.dossiers.completed || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Taux de Completion</span>
                <span className="text-sm font-medium text-green-600">
                  {systemStats?.activity.dossiers.completion_rate || 0}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Taux de Rejet</span>
                <span className="text-sm font-medium text-red-600">
                  {systemStats?.activity.dossiers.rejection_rate || 0}%
                </span>
              </div>
            </CardContent>
          </Card>
          
        </div>
     

       
       
       
     

        {/* Include regular dashboard stats for dossiers */}
        <DashboardStats />

        {/* Last updated info */}
        {systemStats?.updated_at && (
          <Card className="border-l-4 border-l-gray-400">
            <CardContent className="py-4">
              <p className="text-sm text-gray-600">
                Dernière mise à jour: {new Date(systemStats.updated_at).toLocaleString("fr-FR")}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
