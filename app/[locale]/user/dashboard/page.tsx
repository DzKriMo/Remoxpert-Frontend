import DashboardLayout from "@/components/dashboard-layout"
import DashboardStats from "@/components/dashboard-stats"

export default function UserDashboard() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-[#2E8BC0] to-[#5CB85C] text-white p-6 rounded-lg shadow-lg">
          <h1 className="text-3xl font-bold tracking-tight">Mon Tableau de Bord</h1>
          <p className="text-blue-100 mt-2">Vue d'ensemble de vos dossiers et activités</p>
        </div>
        <DashboardStats />
      </div>
    </DashboardLayout>
  )
}
