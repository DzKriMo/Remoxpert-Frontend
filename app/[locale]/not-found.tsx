import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="text-center max-w-md px-4">
        <h1 className="text-6xl font-bold text-[#1F3B4D] mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-4">Page non trouvée</h2>
        <p className="text-gray-600 mb-8">La page que vous recherchez n'existe pas ou a été déplacée.</p>
        <Link href="/">
          <Button className="bg-[#2E8BC0] hover:bg-[#1F3B4D]">Retour à l'accueil</Button>
        </Link>
      </div>
    </div>
  )
}
