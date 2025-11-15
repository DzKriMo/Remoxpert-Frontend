import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import LanguageSwitcher from "@/components/language-switcher"
import RegistrationForm from "@/components/registration-form"
import { Car, Shield, FileText } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-[#1F3B4D] text-white p-4 flex justify-between items-center shadow-md">
        <div className="flex items-center">
          <h1 className="text-xl font-bold ml-2">Remoxpert</h1>
        </div>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <Link href="/login">
            <Button
              variant="outline"
              className="text-white border-white hover:bg-white hover:text-[#1F3B4D]"
            >
              Connexion
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-[#F5F7FA] py-16 px-4 md:py-24">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-[#1F3B4D] mb-4">
                Expertise Automobile à Distance
              </h1>
              <p className="text-lg mb-8 text-gray-600">
                Simplifiez vos expertises automobiles grâce à notre plateforme
                digitale. Gestion des dossiers, communication et suivi en temps
                réel.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/login" className="flex-1 sm:flex-initial">
                  <Button className="w-full bg-[#2E8BC0] hover:bg-[#1F3B4D] text-white px-8 py-6 text-lg">
                    Se connecter
                  </Button>
                </Link>
                <div className="flex-1 sm:flex-initial">
                  <RegistrationForm />
                </div>
              </div>
            </div>
            <div className="flex justify-center">
              <img
                src="logo.png"
                alt="Expertise automobile"
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12 text-[#1F3B4D]">
            Nos Fonctionnalités
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Car className="h-10 w-10 text-[#2E8BC0]" />}
              title="Expertise Digitale"
              description="Réalisez des expertises à distance grâce à notre plateforme numérique."
            />
            <FeatureCard
              icon={<Shield className="h-10 w-10 text-[#2E8BC0]" />}
              title="Sécurité des Données"
              description="Vos données sont sécurisées et conformes aux normes de protection."
            />
            <FeatureCard
              icon={<FileText className="h-10 w-10 text-[#2E8BC0]" />}
              title="Gestion des Dossiers"
              description="Suivez l'état de vos dossiers en temps réel et accédez à l'historique."
            />
          </div>
        </div>
      </section>

      <section className="bg-[#449D44] text-white py-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-4">Nouveau sur Remoxpert ?</h2>
          <p className="text-lg mb-8 opacity-90">
            Demandez l'accès à notre plateforme et rejoignez notre réseau
            d'experts automobiles.
          </p>

          <div className="inline-block">
            <div className="[&>button]:px-8 [&>button]:py-6 [&>button]:text-lg [&>button]:w-auto">
              <RegistrationForm />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#1F3B4D] text-white py-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-4">Déjà membre ?</h2>
          <p className="text-lg mb-8 opacity-90">
            Connectez-vous à votre espace et gérez vos expertises automobiles.
          </p>
          <Link href="/login">
            <Button className="bg-[#2E8BC0] hover:bg-white hover:text-[#1F3B4D] text-white px-8 py-6 text-lg">
              Se connecter maintenant
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#F5F7FA] py-8 px-4 border-t">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h2 className="text-xl font-bold text-[#1F3B4D]">Remoxpert</h2>
              <p className="text-gray-600">Expertise automobile à distance</p>
            </div>
            <div className="text-gray-600">
              &copy; {new Date().getFullYear()} Remoxpert. Tous droits réservés.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <Card className="h-full">
      <CardContent className="p-6 flex flex-col items-center text-center">
        <div className="mb-4">{icon}</div>
        <h3 className="text-xl font-bold mb-2 text-[#1F3B4D]">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </CardContent>
    </Card>
  )
}
