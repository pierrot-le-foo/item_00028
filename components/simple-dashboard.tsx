"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Shield, LogOut, Key, Plus, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { PasswordGenerator } from "./password-generator"

export function SimpleDashboard() {
  const router = useRouter()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("dashboard")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newPassword, setNewPassword] = useState({
    title: "",
    username: "",
    password: "",
    url: "",
    notes: "",
  })
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    // Check for success message
    const successMessage = sessionStorage.getItem("auth_success")
    if (successMessage) {
      toast({
        title: "Success",
        description: successMessage,
      })
      sessionStorage.removeItem("auth_success")
    }
  }, [toast])

  const handleLogout = () => {
    // Clear auth token cookie
    document.cookie = "auth_token=; path=/; max-age=0"
    // Clear master password from session storage
    sessionStorage.removeItem("master_password")
    // Show logout toast
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully.",
    })
    // Reload the page to show login form
    window.location.reload()
  }

  const handleAddPassword = () => {
    // Validate form
    if (!newPassword.title || !newPassword.password) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Title and password are required.",
      })
      return
    }

    // In a real implementation, we would save this to the encrypted vault
    // For this demo, we'll just show a success message
    toast({
      title: "Password Saved",
      description: `Password for "${newPassword.title}" has been saved.`,
    })

    // Reset form and close dialog
    setNewPassword({
      title: "",
      username: "",
      password: "",
      url: "",
      notes: "",
    })
    setIsAddDialogOpen(false)
  }

  const handleUseGeneratedPassword = (password: string) => {
    setNewPassword({ ...newPassword, password })
    setActiveTab("dashboard")
    setIsAddDialogOpen(true)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied",
      description: "Text copied to clipboard",
    })
  }

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold flex items-center">
          <Shield className="mr-2 h-8 w-8 text-primary" />
          Password Vault
        </h1>
        <Button variant="outline" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="dashboard">
            <Key className="mr-2 h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="generator">
            <Shield className="mr-2 h-4 w-4" />
            Password Generator
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Your Passwords</h2>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Password
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Password</DialogTitle>
                  <DialogDescription>Enter the details for the new password entry.</DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={newPassword.title}
                      onChange={(e) => setNewPassword({ ...newPassword, title: e.target.value })}
                      placeholder="e.g., Gmail, Twitter"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="username">Username/Email</Label>
                    <Input
                      id="username"
                      value={newPassword.username}
                      onChange={(e) => setNewPassword({ ...newPassword, username: e.target.value })}
                      placeholder="username@example.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="flex">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={newPassword.password}
                        onChange={(e) => setNewPassword({ ...newPassword, password: e.target.value })}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="ml-2"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    <Button variant="link" className="h-auto p-0 text-xs" onClick={() => setActiveTab("generator")}>
                      Generate a strong password
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="url">Website URL</Label>
                    <Input
                      id="url"
                      value={newPassword.url}
                      onChange={(e) => setNewPassword({ ...newPassword, url: e.target.value })}
                      placeholder="https://example.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Input
                      id="notes"
                      value={newPassword.notes}
                      onChange={(e) => setNewPassword({ ...newPassword, notes: e.target.value })}
                      placeholder="Additional notes..."
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddPassword}>Save Password</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card className="w-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl">Authentication Successful!</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center p-6 text-center">
                <Key className="h-16 w-16 text-primary mb-4" />
                <p className="text-xl font-medium mb-2">You've successfully unlocked your password vault</p>
                <p className="text-muted-foreground mb-6">
                  This is a simplified dashboard to confirm that authentication is working properly.
                </p>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Password
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="generator">
          <PasswordGenerator onSelectPassword={handleUseGeneratedPassword} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

