import ContactClientPage from "./ContactClientPage"

export async function generateStaticParams() {
  return [{ locale: "fr" }, { locale: "en" }, { locale: "ar" }]
}

export default function ContactPage() {
  return <ContactClientPage />
}
