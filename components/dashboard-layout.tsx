"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { dossierAPI } from "@/lib/api-client"
import { useLanguage } from "@/components/language-provider"
import LanguageSwitcher from "@/components/language-switcher"
import { Button } from "@/components/ui/button"
import {
  Briefcase,
  CheckSquare,
  FileText,
  FolderPlus,
  Search,
  MessageSquare,
  LogOut,
  Menu,
  User,
  X,
  Users,
  TrendingUp,
} from "lucide-react"
import { authAPI } from "@/lib/api-client"
import { isAuthenticated, getUserRole, isSuperAdmin } from "@/lib/auth-utils"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { t, language } = useLanguage()
  const [role, setRole] = useState<"superadmin" | "admin" | "client" | null>(null)
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [unseenDossierCount,setUnseenDossierCount]= useState<number>(0);
  const [chnhDossierCount, setChngDossierCount] = useState<number>(0);


    const unDossierCount = async () => {
      try {
        const response = await dossierAPI.getSeenAdmin();
        setUnseenDossierCount(response.data.unseen_count);
        console.log("Unseen Dossier Count:", response.data.unseen_count);
        
      } catch (error) {
        console.error("Error fetching count:", error);
      }
    };
    const chDossierCount = async () => {
      try {
        const response = await dossierAPI.getChangedAdmin();
        setChngDossierCount(response.data.unseen_changes_count);
        console.log("Unseen Dossier Count:", response.data.unseen_count);
      } catch (error) {
        console.error("Error fetching count:", error);
      }
    };

  // Get user role on component mount
  useEffect(() => {
    // Get debug info

  
    if (typeof window !== "undefined") {
      const userDataStr = localStorage.getItem("user")
      const userData = userDataStr ? JSON.parse(userDataStr) : null
      const isSuperAdminFlag = localStorage.getItem("isSuperAdmin")

      setDebugInfo({
        userType: localStorage.getItem("userType"),
        userData,
        isSuperAdminFlag,
        isSuperAdminFunction: isSuperAdmin(),
        role: getUserRole(),
      })
    }

    const userRole = getUserRole()
    setRole(userRole)
    if(userRole=="admin"){  unDossierCount();}
    if(userRole=="client"){chDossierCount();}
    console.log("Current role:", userRole)

    // Redirect to login if not authenticated
    if (!isAuthenticated()) {
      router.push("/login")
      return
    }

    // Redirect based on role and current path
    if (userRole) {
      const localePart = `/${language}`

      // Only redirect if:
      // 1. Client trying to access admin or superadmin routes
      // 2. Regular admin trying to access superadmin routes
      // 3. Any admin/superadmin trying to access user routes

      if (userRole === "client" && (pathname?.includes("/admin/") || pathname?.includes("/superadmin/"))) {
        router.push(`${localePart}/user/consulter-dossier`)
      } else if (userRole === "admin" && pathname?.includes("/superadmin/")) {
        router.push(`${localePart}/admin/dossiers`)
      } else if ((userRole === "admin" || userRole === "superadmin") && pathname?.includes("/user/")) {
        // Redirect admins and superadmins away from user routes
        const redirectPath =
          userRole === "superadmin" ? `${localePart}/superadmin/users` : `${localePart}/admin/dossiers`
        router.push(redirectPath)
      }
      // Superadmins can access both admin and superadmin routes, so no additional redirects needed
    }
  }, [pathname, router, language])

  // Handle logout
  const handleLogout = async () => {
    try {
      await authAPI.logout()
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      // Clear localStorage
      localStorage.removeItem("token")
      localStorage.removeItem("userType")
      localStorage.removeItem("tokenTimestamp")
      localStorage.removeItem("user")
      localStorage.removeItem("isSuperAdmin")

      // Clear cookies
      document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict"
      document.cookie = "userType=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict"
      document.cookie = "isSuperAdmin=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict"

      router.push("/")
    }
  }

  // Navigation items based on role
  const navItems =
    role === "superadmin"
      ? [
          {
            href: `/${language}/superadmin/dashboard`,
            label: "SuperAdmin Dashboard",
            icon: <TrendingUp className="h-5 w-5" />,
          },
          {
            href: `/${language}/superadmin/users`,
            label: t("nav.users") || "Utilisateurs",
            icon: <Users className="h-5 w-5" />,
          },
          {
            href: `/${language}/superadmin/messages`,
            label: "Messages",
            icon: <MessageSquare className="h-5 w-5" />,
          },
          {
            href: `/${language}/admin/dossiers`,
            label: t("nav.dossiers"),
            icon: <Briefcase className="h-5 w-5" />,
          },
          {
            href: `/${language}/admin/dossiers-clotures`,
            label: t("nav.dossiersClotures"),
            icon: <CheckSquare className="h-5 w-5" />,
          },
          {
            href: `/${language}/admin/note-honoraires`,
            label: t("nav.noteHonoraires"),
            icon: <FileText className="h-5 w-5" />,
          },
          {
            href: `/${language}/superadmin/profile`,
            label: "Profil",
            icon: <User className="h-5 w-5" />,
          },
        ]
      : role === "admin"
        ? [
            {
              href: `/${language}/admin/dashboard`,
              label: "Tableau de Bord",
              icon: <TrendingUp className="h-5 w-5" />,
            },
            {
              href: `/${language}/admin/dossiers`,
              label: (
                <div className="flex items-center space-x-2">
                  <span>{t("nav.dossiers")}</span>
                  {unseenDossierCount > 0 && (
                    <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-600 rounded-full">
                      {unseenDossierCount}
                    </span>
                  )}
                </div>
              ),
              icon: <Briefcase className="h-5 w-5" />,
            },
            {
              href: `/${language}/admin/dossiers-clotures`,
              label: t("nav.dossiersClotures"),
              icon: <CheckSquare className="h-5 w-5" />,
            },
            {
              href: `/${language}/admin/note-honoraires`,
              label: t("nav.noteHonoraires"),
              icon: <FileText className="h-5 w-5" />,
            },
            {
              href: `/${language}/admin/profile`,
              label: "Profil",
              icon: <User className="h-5 w-5" />,
            },
          ]
        : [
            {
              href: `/${language}/user/dashboard`,
              label: "Tableau de Bord",
              icon: <TrendingUp className="h-5 w-5" />,
            },
            {
              href: `/${language}/user/nouveau-dossier`,
              label: t("nav.nouveauDossier"),
              icon: <FolderPlus className="h-5 w-5" />,
            },
            {
              href: `/${language}/user/consulter-dossier`,
              label: (
                <div className="flex items-center space-x-2">
                  <span>{t("nav.consulterDossier")}</span>
                  {chnhDossierCount > 0 && (
                    <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-600 rounded-full">
                      {chnhDossierCount}
                    </span>
                  )}
                </div>
              ),
              icon: <Search className="h-5 w-5" />,
            },
            {
              href: `/${language}/user/contact`,
              label: t("nav.contact"),
              icon: <MessageSquare className="h-5 w-5" />,
            },
            {
              href: `/${language}/user/profile`,
              label: "Profil",
              icon: <User className="h-5 w-5" />,
            },
          ];

  // If not authenticated or role not determined yet, show loading state
  if (!role) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-[#1F3B4D] text-white p-4 flex justify-between items-center shadow-md">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden text-white"
          >
            <Menu className="h-6 w-6" />
          </Button>
          <h1 className="text-xl font-bold ml-2">Remoxpert</h1>
        </div>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <Button variant="ghost" size="icon" onClick={handleLogout} className="text-white">
            <LogOut className="h-5 w-5" />
            <span className="sr-only">{t("common.logout")}</span>
          </Button>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar for mobile */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-50 md:hidden" onClick={() => setSidebarOpen(false)}>
            <div
              className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg p-4"
              onClick={(e) => e.stopPropagation()}
              dir={language === "ar" ? "rtl" : "ltr"}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-bold text-lg">Menu</h2>
                <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <nav className="space-y-2">
                {navItems.map((item) => (
                  <Button
                    key={item.href}
                    variant={pathname === item.href ? "default" : "ghost"}
                    className={`w-full justify-start ${pathname === item.href ? "bg-[#2E8BC0] hover:bg-[#2E8BC0]" : ""}`}
                    onClick={() => router.push(item.href)}
                  >
                    {item.icon}
                    <span className="ml-2">{item.label}</span>
                  </Button>
                ))}
              </nav>
            </div>
          </div>
        )}

        {/* Sidebar for desktop */}
        <aside className="hidden md:block w-64 bg-white shadow-md p-4" dir={language === "ar" ? "rtl" : "ltr"}>
          <nav className="space-y-2">
            {navItems.map((item) => (
              <Button
                key={item.href}
                variant={pathname === item.href ? "default" : "ghost"}
                className={`w-full justify-start ${pathname === item.href ? "bg-[#2E8BC0] hover:bg-[#2E8BC0]" : ""}`}
                onClick={() => router.push(item.href)}
              >
                {item.icon}
                <span className="ml-2">{item.label}</span>
              </Button>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-6 overflow-auto" dir={language === "ar" ? "rtl" : "ltr"}>
          {children}
        </main>
      </div>
    </div>
  )
}
