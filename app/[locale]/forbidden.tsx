import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShieldAlert } from "lucide-react"

export default function Forbidden() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="text-center max-w-md px-4">
        <div className="flex justify-center mb-4">
          <ShieldAlert className="h-16 w-16 text-red-500" />
        </div>
        <h1 className="text-4xl font-bold text-[#1F3B4D] mb-4">403</h1>
        <h2 className="text-2xl font-semibold mb-4">Accès Refusé</h2>
        <p className="text-gray-600 mb-8">Vous n'avez pas les autorisations nécessaires pour accéder à cette page.</p>
        <Link href="/">
          <Button className="bg-[#2E8BC0] hover:bg-[#1F3B4D]">Retour à l'accueil</Button>
        </Link>
      </div>
    </div>
  )
}
