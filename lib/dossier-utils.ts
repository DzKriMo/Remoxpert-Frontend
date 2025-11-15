import { format, parse } from "date-fns"
import { dossierAPI } from "./api-client"

// Interface for dossier data based on new API
export interface DossierFormData {
  agence: string
  num_sinistre: string
  date_sinistre: string
  date_declaration: string
  expert_nom?: string
  expert_id?: number | null // Optional expert ID for admin use,
  assure_nom: string
  num_police: string
  compagnie: string
  code_agence: string
  num_chassis: string
  matricule: string
  annee: number
  categorie: string
  date_debut_assurance: string
  date_fin_assurance: string
  tiers_nom: string
  tiers_matricule: string
  tiers_code_agence: string
  tiers_num_police: string
  tiers_compagnie: string
  // File fields
  carte_grise_photo?: File | null
  declaration_recto_photo?: File | null
  declaration_verso_photo?: File | null
  photos_accident?: File[] | null
  // Admin-only fields
  status?: "new" | "in_progress" | "ended"
  link_pv?: string
  link_note?: string
}

// Function to parse QR code data
export function parseQRCode(qrData: string): Partial<DossierFormData> {
  try {
    console.log("Raw QR Data:", qrData)

    // Split by semicolon
    const parts = qrData.split(";")
    console.log("QR Parts:", parts)

    // Parse date from DD-MM-YYYY to YYYY-MM-DD format
    const parseDate = (dateStr: string): string => {
      if (!dateStr || dateStr.trim() === "") return ""
      try {
        // Handle DD-MM-YYYY format
        const parsedDate = parse(dateStr, "dd-MM-yyyy", new Date())
        return format(parsedDate, "yyyy-MM-dd")
      } catch (error) {
        console.error("Error parsing date:", dateStr, error)
        return ""
      }
    }

    // Based on your QR data format:
    // AUTOMOBILE;O;271;271/VP/2025236;23-04-2025;271/VP/2025236;22-04-2025;ANSAR  Moussa;271/VP/56809/0/0;DAGHMOUS SOUFIANE;7190.2025000961;CIAR;7190;VF3581M27G9556099;03229.186.40;1986;03;LEGER;24-12-2024;23-12-2025;14689.113.40;;;CAAT

    const parsedData = {
      // parts[0] = "AUTOMOBILE" (type)
      // parts[1] = "O" (unknown)
      agence: parts[2] || "", // "271"
      num_sinistre: parts[3] || "", // "271/VP/2025236"
      date_sinistre: parseDate(parts[4]), // "23-04-2025"
      // parts[5] = duplicate sinistre number
      date_declaration: parseDate(parts[6]), // "22-04-2025"
      assure_nom: parts[7] || "", // "ANSAR  Moussa"
      num_police: parts[8] || "", // "271/VP/56809/0/0"
      tiers_nom: parts[9] || "", // "DAGHMOUS SOUFIANE"
      tiers_matricule: parts[10] || "", // "7190.2025000961"
      compagnie: parts[11] || "", // "CIAR"
      code_agence: parts[12] || "", // "7190"
      num_chassis: parts[13] || "", // "VF3581M27G9556099"
      matricule: parts[14] || "", // "03229.186.40"
      annee: Number.parseInt(parts[15]) || new Date().getFullYear(), // "1986"
      // parts[16] = "03" (unknown)
      categorie: parts[17] || "LEGER", // "LEGER"
      date_debut_assurance: parseDate(parts[18]), // "24-12-2024"
      date_fin_assurance: parseDate(parts[19]), // "23-12-2025"
      tiers_num_police: parts[20] || "", // "14689.113.40"
      // parts[21] = empty
      // parts[22] = empty
      tiers_compagnie: parts[23] || "", // "CAAT"

      // Set expert name if available
      expert_nom: parts[1] === "O" ? "Expert Auto" : "",

      // Set agency code same as agence for now
      tiers_code_agence: parts[12] || "",
    }

    console.log("Parsed QR Data:", parsedData)
    return parsedData
  } catch (error) {
    console.error("Error parsing QR code:", error)
    throw new Error(`Failed to parse QR code: ${error}`)
  }
}

// Function to create a new dossier with files
export async function createDossier(formData: DossierFormData) {
  try {
    // Create FormData object for file uploads
    const data = new FormData()

    // Add all text fields, excluding file fields and undefined/null values
    const textFields = [
      "agence",
      "num_sinistre",
      "date_sinistre",
      "date_declaration",
      "expert_nom",
      "expert_id", 
      "assure_nom",
      "num_police",
      "compagnie",
      "code_agence",
      "num_chassis",
      "matricule",
      "annee",
      "categorie",
      "date_debut_assurance",
      "date_fin_assurance",
      "tiers_nom",
      "tiers_matricule",
      "tiers_code_agence",
      "tiers_num_police",
      "tiers_compagnie",
    ]

    textFields.forEach((field) => {
      const value = formData[field as keyof DossierFormData]
      if (value !== undefined && value !== null && value !== "") {
        data.append(field, String(value))
      }
    })

    // Validate and add required file fields
    const requiredFiles = [
      { field: "carte_grise_photo", file: formData.carte_grise_photo, name: "Carte grise photo" },
      { field: "declaration_recto_photo", file: formData.declaration_recto_photo, name: "Declaration recto photo" },
      { field: "declaration_verso_photo", file: formData.declaration_verso_photo, name: "Declaration verso photo" },
    ]

    for (const { field, file, name } of requiredFiles) {
      if (!file) {
        throw new Error(`${name} is required`)
      }

      // Validate file type and size
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "application/pdf"]
      if (!allowedTypes.includes(file.type)) {
        throw new Error(`${name} must be JPG, PNG, or PDF format`)
      }

      const maxSize = 10 * 1024 * 1024 // 10MB
      if (file.size > maxSize) {
        throw new Error(`${name} must be less than 10MB`)
      }

      data.append(field, file)
    }

    if (!formData.photos_accident || formData.photos_accident.length === 0) {
      throw new Error("At least one accident photo is required")
    }

    formData.photos_accident.forEach((photo, index) => {
      const allowedImageTypes = ["image/jpeg", "image/jpg", "image/png"]
      if (!allowedImageTypes.includes(photo.type)) {
        throw new Error(`Accident photo ${index + 1} must be JPG or PNG format`)
      }

      const maxSize = 10 * 1024 * 1024 // 10MB
      if (photo.size > maxSize) {
        throw new Error(`Accident photo ${index + 1} must be less than 10MB`)
      }

      data.append("photos_accident[]", photo)
    })

    // Log the FormData contents for debugging (only in development)
    if (process.env.NODE_ENV === "development") {
      console.log("FormData contents:")
      for (const [key, value] of data.entries()) {
        if (value instanceof File) {
          console.log(`${key}: File(${value.name}, ${value.size} bytes, ${value.type})`)
        } else {
          console.log(`${key}: ${value}`)
        }
      }
    }

    // Make the API call
    const response = await dossierAPI.create(data)
    console.log("Dossier creation response:", response)
    return response
  } catch (error: any) {
    console.error("Error in createDossier:", error)

    // Enhanced error handling
    if (error.response) {
      const { status, data } = error.response
      console.error("API Error Response:", { status, data })

      // Create a more descriptive error message
      let errorMessage = `Server error (${status})`

      if (data?.message) {
        errorMessage = data.message
      } else if (data?.error) {
        errorMessage = data.error
      } else if (data?.errors) {
        // Handle validation errors
        const validationErrors = Object.entries(data.errors)
          .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(", ") : messages}`)
          .join("; ")
        errorMessage = `Validation errors: ${validationErrors}`
      }

      throw new Error(errorMessage)
    } else if (error.request) {
      console.error("Network Error:", error.request)
      throw new Error("Network error: Unable to reach the server")
    } else {
      throw error
    }
  }
}

// Function to get all dossiers
export async function getDossiers() {
  try {
    return await dossierAPI.getAll()
  } catch (error) {
    console.error("Error getting dossiers:", error)
    throw error
  }
}

// Function to get a single dossier
export async function getDossier(id: string) {
  try {
    return await dossierAPI.get(id)
  } catch (error) {
    console.error("Error getting dossier:", error)
    throw error
  }
}

// Function to update dossier (admin only)
export async function updateDossier(id: string, data: Partial<DossierFormData>) {
  try {
    return await dossierAPI.update(id, data)
  } catch (error) {
    console.error("Error updating dossier:", error)
    throw error
  }
}

// Function to upload admin documents (PV and Note files) - Admin only
export async function uploadAdminDocs(id: string, files: { pv_file?: File; note_file?: File }) {
  try {
    const formData = new FormData()

    // Validate and add PV file if provided
    if (files.pv_file) {
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ]
      if (!allowedTypes.includes(files.pv_file.type)) {
        throw new Error("PV file must be PDF, DOC, or DOCX format")
      }

      const maxSize = 10 * 1024 * 1024 // 10MB
      if (files.pv_file.size > maxSize) {
        throw new Error("PV file must be less than 10MB")
      }

      formData.append("pv_file", files.pv_file)
    }

    // Validate and add Note file if provided
    if (files.note_file) {
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ]
      if (!allowedTypes.includes(files.note_file.type)) {
        throw new Error("Note file must be PDF, DOC, or DOCX format")
      }

      const maxSize = 10 * 1024 * 1024 // 10MB
      if (files.note_file.size > maxSize) {
        throw new Error("Note file must be less than 10MB")
      }

      formData.append("note_file", files.note_file)
    }

    if (!files.pv_file && !files.note_file) {
      throw new Error("At least one file (PV or Note) must be provided")
    }

    return await dossierAPI.uploadAdminDocs(id, formData)
  } catch (error: any) {
    console.error("Error uploading admin docs:", error)

    // Enhanced error handling
    if (error.response) {
      const { status, data } = error.response
      console.error("API Error Response:", { status, data })

      let errorMessage = `Server error (${status})`

      if (data?.message) {
        errorMessage = data.message
      } else if (data?.error) {
        errorMessage = data.error
      } else if (data?.errors) {
        const validationErrors = Object.entries(data.errors)
          .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(", ") : messages}`)
          .join("; ")
        errorMessage = `Validation errors: ${validationErrors}`
      }

      throw new Error(errorMessage)
    } else if (error.request) {
      console.error("Network Error:", error.request)
      throw new Error("Network error: Unable to reach the server")
    } else {
      throw error
    }
  }
}

// Function to download files
export async function downloadDossierFile(
  dossierId: string,
  type: "pv" | "note" | "carte_grise" | "declaration_recto" | "declaration_verso",
) {
  try {
    return await dossierAPI.downloadFile(dossierId, type)
  } catch (error) {
    console.error("Error downloading file:", error)
    throw error
  }
}

// Function to download accident photo
export async function downloadAccidentPhoto(dossierId: string, index: number) {
  try {
    return await dossierAPI.downloadAccidentPhoto(dossierId, index)
  } catch (error) {
    console.error("Error downloading accident photo:", error)
    throw error
  }
}
