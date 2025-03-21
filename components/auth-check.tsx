"use client"

import { useEffect, useState } from "react"
import { AuthForm } from "./auth-form"
import { SimpleDashboard } from "./simple-dashboard"
import { useToast } from "@/components/ui/use-toast"

export function AuthCheck() {
  const { toast } = useToast()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    // Check if auth_token cookie exists
    const hasCookie = document.cookie.split(";").some((item) => item.trim().startsWith("auth_token="))

    if (!hasCookie) {
      setIsAuthenticated(false)
      return
    }

    // Check if master password is in session storage
    const masterPassword = sessionStorage.getItem("master_password")
    if (!masterPassword) {
      // If cookie exists but no master password, clear the cookie
      document.cookie = "auth_token=; path=/; max-age=0"
      sessionStorage.setItem("auth_error", "Session expired. Please log in again.")
      setIsAuthenticated(false)
      return
    }

    setIsAuthenticated(true)
  }, [toast])

  if (isAuthenticated === null) {
    // Loading state
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return isAuthenticated ? <SimpleDashboard /> : <AuthForm />
}

