import DashboardLayout from "@/components/dashboard-layout"
import DashboardStats from "@/components/dashboard-stats"

export default function AdminDashboard() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-[#1F3B4D] to-[#2E8BC0] text-white p-6 rounded-lg shadow-lg">
          <h1 className="text-3xl font-bold tracking-tight">Tableau de Bord Expert</h1>
          <p className="text-blue-100 mt-2">Vue d'ensemble de votre activité et statistiques</p>
        </div>
        <DashboardStats />
      </div>
    </DashboardLayout>
  )
}
