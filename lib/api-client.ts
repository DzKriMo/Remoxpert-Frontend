import axios from "axios"
import { jwtDecode } from "jwt-decode"

// Create an Axios instance with default config
export const apiClient = axios.create({
  baseURL: "https://remoxpert.com/api/index.php/api/", //////// Change this to your actual API base URL
  headers: {
    "Content-Type": "application/json",
  },
})

interface TokenData {
  exp: number
  type: "admin" | "client"
}

// Function to check if token is about to expire (within 5 minutes)
function isTokenExpiring(token: string): boolean {
  try {
    const decoded = jwtDecode<TokenData>(token)
    const currentTime = Date.now() / 1000
    return decoded.exp - currentTime < 300 // Less than 5 minutes until expiration
  } catch (error) {
    return true
  }
}

// Add a request interceptor to include auth token
apiClient.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem("token")
    const userType = localStorage.getItem("userType")
    const tokenTimestamp = localStorage.getItem("tokenTimestamp")

    if (token) {
      // Add token to headers
      config.headers.Authorization = `Bearer ${token}`

      // Add User-Type header
      if (userType) {
        config.headers["User-Type"] = userType
      }

      // Check if token is about to expire and refresh if needed
      if (tokenTimestamp && isTokenExpiring(token)) {
        try {
          const response = await axios.post(
            "https://remoxpert.com/api/index.php/api/refresh",
            {},
            { headers: { Authorization: `Bearer ${token}` } },
          )

          const newToken = response.data.access_token
          localStorage.setItem("token", newToken)
          localStorage.setItem("tokenTimestamp", Date.now().toString())

          // Update the Authorization header with the new token
          config.headers.Authorization = `Bearer ${newToken}`
        } catch (error) {
          console.error("Failed to refresh token:", error)
          // Clear storage and redirect to login on refresh failure
          localStorage.removeItem("token")
          localStorage.removeItem("userType")
          localStorage.removeItem("tokenTimestamp")
          window.location.href = "/"
        }
      }
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Add a response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      if (error.config && error.config.url && error.config.url.includes("/login")) {
        return Promise.reject(error)
      }

      localStorage.removeItem("token")
      localStorage.removeItem("userType")
      localStorage.removeItem("tokenTimestamp")
      localStorage.removeItem("user")
      window.location.href = "/"
    }
    return Promise.reject(error)
  },
)

export const authAPI = {
  login: async (email: string, password: string, type: "admin" | "client") => {
    try {
      return await apiClient.post("/login", { email, password, type })
    } catch (error) {
      console.log(`Login attempt failed for ${type}:`, error)
      throw error
    }
  },

  refresh: () => apiClient.post("/refresh"),

  logout: () => apiClient.post("/logout"),

  getProfile: () => apiClient.get("/me"),
}

export const userAPI = {
  createAdmin: (data: { name: string; email: string; password: string }) => apiClient.post("/users/admin", data),

  createClient: (data: { name: string; email: string; code: string; password: string }) =>
    apiClient.post("/users/client", data),

  getAdmins: () => apiClient.get("/users/admins"),

  getClients: () => apiClient.get("/users/clients"),

  deleteUser: (data: { password: string; user_id: string; user_type: "admin" | "client" }) =>
    apiClient.post("/users/delete", data),

  forcePasswordReset: (data: {
    target_type: "admin" | "client"
    target_id: number
    new_password: string
    new_password_confirmation: string
    superadmin_password: string
  }) => apiClient.post("/force-password-reset", data),
  
}

export const dossierAPI = {
  getAll: (params?: any) => apiClient.get("/dossiers", { params }),

  get: (id: string) => apiClient.get(`/dossiers/${id}`),

  create: (data: FormData) => {
    return apiClient.post("/dossiers", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 60000, 
      maxContentLength: 100 * 1024 * 1024, 
      maxBodyLength: 100 * 1024 * 1024, 
    })
  },

  update: (id: string, data: any) => apiClient.patch(`/dossiers/${id}`, data),

  uploadAdminDocs: (id: string, data: FormData) => {
    return apiClient.post(`/dossiers/${id}/admin-docs`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 60000, 
      maxContentLength: 50 * 1024 * 1024, 
      maxBodyLength: 50 * 1024 * 1024, 
    })
  },

  downloadFile: (dossierId: string, type: "pv" | "note" | "carte_grise" | "declaration_recto" | "declaration_verso") =>
    apiClient.get(`/dossiers/${dossierId}/files/${type}`, { responseType: "blob" }),

  downloadAccidentPhoto: (dossierId: string, index: number) =>
    apiClient.get(`/dossiers/${dossierId}/accident-photos/${index}`, { responseType: "blob" }),
  getExperts: () => apiClient.get("/admins"),

  getSeenAdmin: () => apiClient.get("/dossiers/seenadmin"),
  postSeenAdmin: () => apiClient.post("/dossiers/seenadmin"),

  getChangedAdmin: () => apiClient.get("/dossiers/adminchange"),
  postChangedAdmin: () => apiClient.post("/dossiers/adminchange"),
}
