"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { z } from "zod"
import { Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { encryptData } from "@/lib/encryption"

// Form validation schema
const formSchema = z.object({
  masterPassword: z.string().min(8, {
    message: "Master password must be at least 8 characters",
  }),
  confirmPassword: z.string(),
})

export function AuthForm() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("login")
  const [masterPassword, setMasterPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Check if there was a previous authentication error
  useEffect(() => {
    const authError = sessionStorage.getItem("auth_error")
    if (authError) {
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: authError,
      })
      sessionStorage.removeItem("auth_error")
    }
  }, [toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      // Validate form
      const result = formSchema.safeParse({
        masterPassword,
        confirmPassword: activeTab === "register" ? confirmPassword : masterPassword,
      })

      if (!result.success) {
        setError(result.error.errors[0].message)
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: result.error.errors[0].message,
        })
        setIsLoading(false)
        return
      }

      if (activeTab === "register" && masterPassword !== confirmPassword) {
        setError("Passwords do not match")
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: "Passwords do not match",
        })
        setIsLoading(false)
        return
      }

      // Create auth token and store in cookie
      const authToken = encryptData("authenticated", masterPassword)
      document.cookie = `auth_token=${authToken}; path=/; max-age=${60 * 60 * 24 * 7}` // 1 week

      // Store master password in sessionStorage for later use
      sessionStorage.setItem("master_password", masterPassword)

      // Initialize empty password vault if registering
      if (activeTab === "register") {
        const emptyVault = encryptData(JSON.stringify([]), masterPassword)
        localStorage.setItem("password_vault", emptyVault)

        // Set success message for dashboard
        sessionStorage.setItem("auth_success", "Vault created successfully!")
      } else {
        // Set success message for dashboard
        sessionStorage.setItem("auth_success", "Vault unlocked successfully!")
      }

      // Force a hard refresh to ensure server components re-render
      window.location.href = window.location.href
    } catch (err) {
      console.error("Authentication error:", err)
      setError("An error occurred. Please try again.")
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "An error occurred. Please try again.",
      })
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-2">
            <div className="p-2 rounded-full bg-primary/10">
              <Lock className="w-10 h-10 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Password Vault</CardTitle>
          <CardDescription className="text-center">Secure your passwords with end-to-end encryption</CardDescription>
        </CardHeader>
        <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <CardContent className="pt-4">
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Input
                      id="masterPassword"
                      type="password"
                      placeholder="Master Password"
                      value={masterPassword}
                      onChange={(e) => setMasterPassword(e.target.value)}
                      required
                    />
                  </div>

                  {error && <p className="text-sm text-destructive">{error}</p>}

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Unlocking..." : "Unlock Vault"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </TabsContent>
          <TabsContent value="register">
            <CardContent className="pt-4">
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Input
                      id="masterPassword"
                      type="password"
                      placeholder="Master Password"
                      value={masterPassword}
                      onChange={(e) => setMasterPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm Master Password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>

                  {error && <p className="text-sm text-destructive">{error}</p>}

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Creating..." : "Create Vault"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </TabsContent>
        </Tabs>
        <CardFooter className="flex flex-col">
          <p className="text-xs text-muted-foreground text-center">
            Your master password is used to encrypt your data. We cannot recover it if you forget.
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}

