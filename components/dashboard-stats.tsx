"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Briefcase, CheckSquare, Clock, Users, TrendingUp, Eye, Plus, AlertCircle, XCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useLanguage } from "@/components/language-provider"
import { getUserRole } from "@/lib/auth-utils"
import { dossierAPI } from "@/lib/api-client"
import { apiClient } from "@/lib/api-client"

interface DossierStats {
  total: number
  new: number
  in_progress: number
  ended: number
  rejected: number
  recent: any[]
}

interface ClientStats {
  total_clients: number
  active_clients_last_7_days: number
  inactive_clients: number
  updated_at: string
}

interface AdminStats extends DossierStats {
  clientStats?: ClientStats
}

export default function DashboardStats() {
  const [stats, setStats] = useState<DossierStats | AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { t, language } = useLanguage()
  const userRole = getUserRole()

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await dossierAPI.getAll()
      console.log("Dashboard API response:", response)

      // Handle different response formats
      let dossiers = []
      if (response.data && Array.isArray(response.data)) {
        dossiers = response.data
      } else if (Array.isArray(response)) {
        dossiers = response
      } else if (response.data && response.data.dossiers && Array.isArray(response.data.dossiers)) {
        dossiers = response.data.dossiers
      } else {
        console.log("Unexpected response format:", response)
        dossiers = []
      }

      const statsData: DossierStats = {
        total: dossiers.length,
        new: dossiers.filter((d: any) => d.status === "new").length,
        in_progress: dossiers.filter((d: any) => d.status === "in_progress").length,
        ended: dossiers.filter((d: any) => d.status === "ended").length,
        rejected: dossiers.filter((d: any) => d.status === "rejected").length,
        recent: (() => {
          // Sort by updated_at in descending order (most recent first)
          const sortedDossiers = dossiers.sort((a: any, b: any) => {
            const dateA = new Date(a.updated_at || a.created_at || 0).getTime()
            const dateB = new Date(b.updated_at || b.created_at || 0).getTime()
            return dateB - dateA
          })

          // For admin/superadmin: show 3 most recent, for users: show 5
          const limit = userRole === "admin" || userRole === "superadmin" ? 3 : 5
          return sortedDossiers.slice(0, limit)
        })(),
      }

      // For admin, add real user stats
      if (userRole === "admin" || userRole === "superadmin") {
        try {
          const clientStatsResponse = await apiClient.get("/stats/clients")
          const clientStats = clientStatsResponse.data

          const adminStats: AdminStats = {
            ...statsData,
            clientStats: clientStats,
          }
          setStats(adminStats)
        } catch (clientError) {
          console.error("Error fetching client stats:", clientError)
          // Fallback to dossier stats only if client stats fail
          setStats(statsData)
        }
      } else {
        setStats(statsData)
      }
    } catch (err: any) {
      console.error("Error fetching stats:", err)
      setError(`Erreur de chargement: ${err.message || "Erreur inconnue"}`)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "in_progress":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "ended":
        return "bg-green-100 text-green-800 border-green-200"
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "new":
        return "Nouveau"
      case "in_progress":
        return "En cours"
      case "ended":
        return "Terminé"
      case "rejected":
        return "Rejeté"
      default:
        return status
    }
  }

  const handleStatCardClick = (filter: string) => {
    const isAdmin = userRole === "admin" || userRole === "superadmin"
    const basePath = isAdmin ? "admin/dossiers" : "user/consulter-dossier"

    if (filter === "all") {
      router.push(`/${language}/${basePath}`)
    } else {
      router.push(`/${language}/${basePath}?status=${filter}`)
    }
  }

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="animate-pulse border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-gray-200 rounded w-20"></div>
              <div className="h-4 w-4 bg-gray-200 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-24"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card className="col-span-full border-l-4 border-l-red-500">
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-2 font-semibold">{error}</p>
            <p className="text-sm text-gray-500 mb-4">Vérifiez votre connexion et réessayez</p>
            <Button onClick={fetchStats} className="mt-4 bg-red-600 hover:bg-red-700">
              Réessayer
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!stats) {
    return (
      <Card className="col-span-full border-l-4 border-l-gray-400">
        <CardContent className="flex items-center justify-center py-8">
          <p className="text-gray-500">Aucune donnée disponible</p>
        </CardContent>
      </Card>
    )
  }

  const isAdmin = userRole === "admin" || userRole === "superadmin"
  const adminStats = stats as AdminStats

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card
          className="border-l-4 border-l-[#2E8BC0] hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-white to-blue-50 cursor-pointer hover:scale-105"
          onClick={() => handleStatCardClick("all")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#1F3B4D]">Total Dossiers</CardTitle>
            <Briefcase className="h-4 w-4 text-[#2E8BC0]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#1F3B4D]">{stats.total}</div>
            <p className="text-xs text-gray-600">{isAdmin ? "Tous les dossiers" : "Vos dossiers"}</p>
          </CardContent>
        </Card>

        <Card
          className="border-l-4 border-l-blue-500 hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-white to-blue-50 cursor-pointer hover:scale-105"
          onClick={() => handleStatCardClick("new")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#1F3B4D]">Nouveaux</CardTitle>
            <Plus className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.new}</div>
            <p className="text-xs text-gray-600">Dossiers nouveaux</p>
          </CardContent>
        </Card>

        <Card
          className="border-l-4 border-l-yellow-500 hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-white to-yellow-50 cursor-pointer hover:scale-105"
          onClick={() => handleStatCardClick("in_progress")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#1F3B4D]">En cours</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.in_progress}</div>
            <p className="text-xs text-gray-600">Dossiers en traitement</p>
          </CardContent>
        </Card>

        <Card
          className="border-l-4 border-l-[#5CB85C] hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-white to-green-50 cursor-pointer hover:scale-105"
          onClick={() => handleStatCardClick("ended")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#1F3B4D]">Terminés</CardTitle>
            <CheckSquare className="h-4 w-4 text-[#5CB85C]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#5CB85C]">{stats.ended}</div>
            <p className="text-xs text-gray-600">Dossiers clôturés</p>
          </CardContent>
        </Card>

        <Card
          className="border-l-4 border-l-red-500 hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-white to-red-50 cursor-pointer hover:scale-105"
          onClick={() => handleStatCardClick("rejected")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#1F3B4D]">Rejetés</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            <p className="text-xs text-gray-600">Dossiers rejetés</p>
          </CardContent>
        </Card>
      </div>

      {/* Admin-only stats */}
      {isAdmin && adminStats.clientStats && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-white to-purple-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#1F3B4D]">Total Clients</CardTitle>
              <Users className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{adminStats.clientStats.total_clients}</div>
              <p className="text-xs text-gray-600">Clients enregistrés</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-indigo-500 hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-white to-indigo-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#1F3B4D]">Clients Actifs</CardTitle>
              <TrendingUp className="h-4 w-4 text-indigo-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-indigo-600">
                {adminStats.clientStats.active_clients_last_7_days}
              </div>
              <p className="text-xs text-gray-600">Actifs (7 derniers jours)</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-gray-500 hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-white to-gray-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#1F3B4D]">Clients Inactifs</CardTitle>
              <Users className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">{adminStats.clientStats.inactive_clients}</div>
              <p className="text-xs text-gray-600">Clients inactifs</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Dossiers */}
      <Card className="border-l-4 border-l-[#5CB85C] bg-gradient-to-br from-white to-green-50">
        <CardHeader>
          <CardTitle className="text-[#1F3B4D]">Dossiers Récents</CardTitle>
          <CardDescription>{isAdmin ? "Derniers dossiers créés" : "Vos derniers dossiers"}</CardDescription>
        </CardHeader>
        <CardContent>
          {stats.recent && stats.recent.length > 0 ? (
            <div className="space-y-3">
              {stats.recent.map((dossier: any, index: number) => (
                <div
                  key={dossier.id || index}
                  className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow duration-200 bg-white cursor-pointer"
                  onClick={() => {
                    const basePath = isAdmin ? "admin/dossiers" : "user/consulter-dossier"
                    router.push(`/${language}/${basePath}/${dossier.id}`)
                  }}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-[#1F3B4D]">
                        {dossier.num_sinistre || `Dossier ${index + 1}`}
                      </span>
                      <Badge className={`${getStatusColor(dossier.status)} border`}>
                        {getStatusText(dossier.status)}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {dossier.assure_nom || "N/A"} • {dossier.compagnie || "N/A"}
                    </p>
                  </div>
                  <Eye className="h-4 w-4 text-[#2E8BC0]" />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Aucun dossier trouvé</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
