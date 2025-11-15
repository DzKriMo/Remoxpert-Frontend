import { jwtDecode } from "jwt-decode"
import { type NextRequest, NextResponse } from "next/server"

interface TokenData {
  exp: number
  type: "admin" | "client"
}

interface UserData {
  is_superadmin?: number
}

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false

  const token = localStorage.getItem("token")
  if (!token) return false

  try {
    const decoded = jwtDecode<TokenData>(token)
    const currentTime = Date.now() / 1000
    return decoded.exp > currentTime
  } catch (error) {
    return false
  }
}

// Update getUserRole to be more robust
export function getUserRole(): "superadmin" | "admin" | "client" | null {
  if (typeof window === "undefined") return null

  try {
    const isSuperAdmin = localStorage.getItem("isSuperAdmin")
    if (isSuperAdmin === "true") {
      return "superadmin"
    }

    const userType = localStorage.getItem("userType")
    if (!userType) return null

    // If not superadmin, check user data
    const userDataStr = localStorage.getItem("user")
    if (userDataStr) {
      try {
        const userData = JSON.parse(userDataStr) as UserData
        console.log("User data in getUserRole:", userData)

        if (userType === "admin" && userData.is_superadmin === 1) {
          // If we found a superadmin, store the flag for future checks
          localStorage.setItem("isSuperAdmin", "true")
          return "superadmin"
        }
      } catch (e) {
        console.error("Error parsing user data:", e)
      }
    }

    // Otherwise just use the userType
    if (userType === "admin") {
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

export function isSuperAdmin(): boolean {
  // Direct check for the superadmin flag
  if (typeof window !== "undefined") {
    const isSuperAdmin = localStorage.getItem("isSuperAdmin")
    if (isSuperAdmin === "true") {
      return true
    }
  }

  // Fallback to role check
  const role = getUserRole()
  return role === "superadmin"
}

// Middleware for protected routes
export function authMiddleware(request: NextRequest) {
  // This is a placeholder for future implementation
  // For now, we'll just return the request
  return NextResponse.next()
}

export async function createUserAccount(userData: any) {
  // In a real application, you would send this data to your backend
  // to create a new user account.
  console.log("Creating user account:", userData)
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true })
    }, 1000)
  })
}

export async function importUsersFromFile(file: File) {
  console.log("Importing users from file:", file.name)
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true })
    }, 1000)
  })
}
