import MessagesManagementClientPage from "./MessagesManagementClientPage"

export async function generateStaticParams() {
  return [{ locale: "fr" }, { locale: "en" }, { locale: "ar" }]
}

export default function MessagesPage() {
  return <MessagesManagementClientPage />
}
