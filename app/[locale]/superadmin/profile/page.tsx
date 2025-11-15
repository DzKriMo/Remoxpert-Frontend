import ProfilePage from "@/components/profile-page"

export async function generateStaticParams() {
  return [{ locale: "fr" }, { locale: "en" }, { locale: "ar" }]
}

export default function SuperAdminProfilePage() {
  return <ProfilePage userType="admin" />
}
