import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtDecode } from "jwt-decode"

interface TokenData {
  exp: number
  type: string
}

// Helper function to get user role from token and cookies
function getUserRoleFromRequest(request: NextRequest): string | null {
  try {
    // First check if there's a direct superadmin flag in cookies
    const isSuperAdmin = request.cookies.get("isSuperAdmin")?.value
    if (isSuperAdmin === "true") {
      return "superadmin"
    }

    // Get the token and user type from cookies
    const token = request.cookies.get("token")?.value
    const userType = request.cookies.get("userType")?.value

    if (!token || !userType) return null

    // Validate token expiration
    const decoded = jwtDecode<TokenData>(token)
    const currentTime = Date.now() / 1000
    if (decoded.exp <= currentTime) return null

    // Return role based on user type
    if (userType === "admin") {
      // Note: We can't check is_superadmin here because we don't have access to the user data
      // in the middleware. We rely on the isSuperAdmin cookie set during login.
      return "admin"
    } else if (userType === "client") {
      return "client"
    }

    return null
  } catch (error) {
    console.error("Error getting user role:", error)
    return null
  }
}

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // Get the pathname from the URL
  const { pathname } = request.nextUrl

  // Skip middleware for static files, api routes, and the root path
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/" ||
    pathname === "/login" ||
    pathname.includes(".") // Skip files like favicon.ico
  ) {
    return NextResponse.next()
  }

  // Get user role from request
  const role = getUserRoleFromRequest(request)

  // If role couldn't be determined, redirect to login
  if (!role) {
    const url = new URL("/login", request.url)
    return NextResponse.redirect(url)
  }

  // Check if user is trying to access a route they shouldn't
  const locale = pathname.split("/")[1] // Get locale from URL

  // Role-based access control
  if (pathname.includes(`/${locale}/user/`)) {
    // Only clients can access user routes
    if (role === "admin" || role === "superadmin") {
      const redirectPath = role === "superadmin" ? `/${locale}/superadmin/dashboard` : `/${locale}/admin/dashboard`
      const url = new URL(redirectPath, request.url)
      return NextResponse.redirect(url)
    }
  } else if (pathname.includes(`/${locale}/admin/`)) {
    // Only admins and superadmins can access admin routes
    if (role === "client") {
      const url = new URL(`/${locale}/user/dashboard`, request.url)
      return NextResponse.redirect(url)
    }
    // Special case: redirect superadmins from admin dashboard to superadmin dashboard
    if (role === "superadmin" && pathname.includes(`/${locale}/admin/dashboard`)) {
      const url = new URL(`/${locale}/superadmin/dashboard`, request.url)
      return NextResponse.redirect(url)
    }
    // Superadmins can access all other admin routes (dossiers, etc.)
  } else if (pathname.includes(`/${locale}/superadmin/`)) {
    // Only superadmins can access superadmin routes
    if (role !== "superadmin") {
      if (role === "admin") {
        const url = new URL(`/${locale}/admin/dashboard`, request.url)
        return NextResponse.redirect(url)
      } else {
        const url = new URL(`/${locale}/user/dashboard`, request.url)
        return NextResponse.redirect(url)
      }
    }
  }

  // Allow the request to proceed
  return NextResponse.next()
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    // Match all paths except static files
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}
