import CryptoJS from "crypto-js"

// Encrypt data using AES
export function encryptData(data: string, password: string): string {
  return CryptoJS.AES.encrypt(data, password).toString()
}

// Decrypt data using AES
export function decryptData(encryptedData: string, password: string): string {
  const bytes = CryptoJS.AES.decrypt(encryptedData, password)
  return bytes.toString(CryptoJS.enc.Utf8)
}

// Update the getMasterPassword function to handle the case when the password is not in sessionStorage
export function getMasterPassword(): string | null {
  try {
    // First check if the master password is in sessionStorage
    const masterPassword = sessionStorage.getItem("master_password")
    if (masterPassword) {
      return masterPassword
    }

    // If not in sessionStorage, check for auth cookie
    const cookies = document.cookie.split(";")
    const authCookie = cookies.find((cookie) => cookie.trim().startsWith("auth_token="))

    if (!authCookie) return null

    const authToken = authCookie.split("=")[1]
    if (!authToken) return null

    // Prompt the user for their master password
    const password = prompt("Please enter your master password to unlock your vault:")
    if (!password) return null

    // Verify the password by trying to decrypt the auth token
    try {
      const decrypted = decryptData(authToken, password)
      if (decrypted === "authenticated") {
        // Store in sessionStorage for this session
        sessionStorage.setItem("master_password", password)
        return password
      }
      alert("Invalid master password")
      return null
    } catch {
      alert("Invalid master password")
      return null
    }
  } catch (error) {
    console.error("Error getting master password:", error)
    return null
  }
}

