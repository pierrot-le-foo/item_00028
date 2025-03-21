"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { PlusCircle, Search, LogOut, Key, Shield, Copy, Eye, EyeOff, Trash, Edit, Save, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
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
import { PasswordGenerator } from "@/components/password-generator"
import { decryptData, encryptData, getMasterPassword } from "@/lib/encryption"
import type { PasswordEntry } from "@/lib/types"

export function PasswordDashboard() {
  const router = useRouter()
  const [passwords, setPasswords] = useState<PasswordEntry[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newEntry, setNewEntry] = useState<Partial<PasswordEntry>>({
    id: "",
    title: "",
    username: "",
    password: "",
    url: "",
    notes: "",
  })
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({})

  // Load passwords from localStorage
  useEffect(() => {
    try {
      const masterPassword = getMasterPassword()
      if (!masterPassword) {
        handleLogout()
        return
      }

      const encryptedData = localStorage.getItem("password_vault")
      if (encryptedData) {
        try {
          const decryptedData = decryptData(encryptedData, masterPassword)
          setPasswords(JSON.parse(decryptedData))
        } catch (error) {
          console.error("Failed to decrypt password vault:", error)
          alert("Could not decrypt your password vault. Please log in again.")
          handleLogout()
        }
      } else if (masterPassword) {
        // If we have a master password but no vault, initialize an empty one
        const emptyVault = encryptData(JSON.stringify([]), masterPassword)
        localStorage.setItem("password_vault", emptyVault)
        setPasswords([])
      }
    } catch (error) {
      console.error("Failed to load passwords:", error)
      handleLogout()
    }
  }, [])

  // Save passwords to localStorage
  const savePasswords = (updatedPasswords: PasswordEntry[]) => {
    try {
      const masterPassword = getMasterPassword()
      if (!masterPassword) {
        handleLogout()
        return
      }

      const encryptedData = encryptData(JSON.stringify(updatedPasswords), masterPassword)
      localStorage.setItem("password_vault", encryptedData)
      setPasswords(updatedPasswords)
    } catch (error) {
      console.error("Failed to save passwords:", error)
    }
  }

  const handleLogout = () => {
    document.cookie = "auth_token=; path=/; max-age=0"
    router.refresh()
  }

  const handleAddPassword = () => {
    if (!newEntry.title || !newEntry.password) return

    const entry: PasswordEntry = {
      id: crypto.randomUUID(),
      title: newEntry.title || "",
      username: newEntry.username || "",
      password: newEntry.password || "",
      url: newEntry.url || "",
      notes: newEntry.notes || "",
      createdAt: new Date().toISOString(),
    }

    savePasswords([...passwords, entry])
    setNewEntry({
      id: "",
      title: "",
      username: "",
      password: "",
      url: "",
      notes: "",
    })
    setIsAddDialogOpen(false)
  }

  const handleUpdatePassword = () => {
    if (!editingId) return

    const updatedPasswords = passwords.map((p) => (p.id === editingId ? { ...p, ...newEntry, id: editingId } : p))

    savePasswords(updatedPasswords)
    setEditingId(null)
  }

  const handleDeletePassword = (id: string) => {
    const updatedPasswords = passwords.filter((p) => p.id !== id)
    savePasswords(updatedPasswords)
  }

  const handleEdit = (password: PasswordEntry) => {
    setEditingId(password.id)
    setNewEntry(password)
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setNewEntry({
      id: "",
      title: "",
      username: "",
      password: "",
      url: "",
      notes: "",
    })
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const filteredPasswords = passwords.filter(
    (p) =>
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.url.toLowerCase().includes(searchTerm.toLowerCase()),
  )

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

      <Tabs defaultValue="passwords">
        <TabsList className="mb-4">
          <TabsTrigger value="passwords">
            <Key className="mr-2 h-4 w-4" />
            Passwords
          </TabsTrigger>
          <TabsTrigger value="generator">
            <Shield className="mr-2 h-4 w-4" />
            Generator
          </TabsTrigger>
        </TabsList>

        <TabsContent value="passwords" className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search passwords..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
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
                      value={newEntry.title}
                      onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
                      placeholder="e.g., Gmail, Twitter"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="username">Username/Email</Label>
                    <Input
                      id="username"
                      value={newEntry.username}
                      onChange={(e) => setNewEntry({ ...newEntry, username: e.target.value })}
                      placeholder="username@example.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="flex">
                      <Input
                        id="password"
                        type={showPassword["new"] ? "text" : "password"}
                        value={newEntry.password}
                        onChange={(e) => setNewEntry({ ...newEntry, password: e.target.value })}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="ml-2"
                        onClick={() => setShowPassword({ ...showPassword, new: !showPassword["new"] })}
                      >
                        {showPassword["new"] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="url">Website URL</Label>
                    <Input
                      id="url"
                      value={newEntry.url}
                      onChange={(e) => setNewEntry({ ...newEntry, url: e.target.value })}
                      placeholder="https://example.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Input
                      id="notes"
                      value={newEntry.notes}
                      onChange={(e) => setNewEntry({ ...newEntry, notes: e.target.value })}
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

          {filteredPasswords.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <Key className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">
                  {searchTerm ? "No passwords match your search." : "No passwords saved yet. Add your first password."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredPasswords.map((password) => (
                <Card key={password.id}>
                  <CardContent className="p-4">
                    {editingId === password.id ? (
                      <div className="space-y-4 py-2">
                        <div className="space-y-2">
                          <Label htmlFor={`edit-title-${password.id}`}>Title</Label>
                          <Input
                            id={`edit-title-${password.id}`}
                            value={newEntry.title}
                            onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`edit-username-${password.id}`}>Username/Email</Label>
                          <Input
                            id={`edit-username-${password.id}`}
                            value={newEntry.username}
                            onChange={(e) => setNewEntry({ ...newEntry, username: e.target.value })}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`edit-password-${password.id}`}>Password</Label>
                          <div className="flex">
                            <Input
                              id={`edit-password-${password.id}`}
                              type={showPassword[password.id] ? "text" : "password"}
                              value={newEntry.password}
                              onChange={(e) => setNewEntry({ ...newEntry, password: e.target.value })}
                              className="flex-1"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="ml-2"
                              onClick={() =>
                                setShowPassword({ ...showPassword, [password.id]: !showPassword[password.id] })
                              }
                            >
                              {showPassword[password.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`edit-url-${password.id}`}>Website URL</Label>
                          <Input
                            id={`edit-url-${password.id}`}
                            value={newEntry.url}
                            onChange={(e) => setNewEntry({ ...newEntry, url: e.target.value })}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`edit-notes-${password.id}`}>Notes</Label>
                          <Input
                            id={`edit-notes-${password.id}`}
                            value={newEntry.notes}
                            onChange={(e) => setNewEntry({ ...newEntry, notes: e.target.value })}
                          />
                        </div>

                        <div className="flex justify-end space-x-2 mt-4">
                          <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                            <X className="mr-2 h-4 w-4" />
                            Cancel
                          </Button>
                          <Button size="sm" onClick={handleUpdatePassword}>
                            <Save className="mr-2 h-4 w-4" />
                            Save
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-lg">{password.title}</h3>
                            {password.url && (
                              <a
                                href={password.url.startsWith("http") ? password.url : `https://${password.url}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-muted-foreground hover:underline"
                              >
                                {password.url}
                              </a>
                            )}
                          </div>
                          <div className="flex space-x-1">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(password)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeletePassword(password.id)}>
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="mt-4 space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Username/Email:</span>
                            <div className="flex items-center">
                              <span className="text-sm mr-2">{password.username}</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => copyToClipboard(password.username)}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>

                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Password:</span>
                            <div className="flex items-center">
                              <span className="text-sm mr-2">
                                {showPassword[password.id] ? password.password : "••••••••"}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 mr-1"
                                onClick={() =>
                                  setShowPassword({ ...showPassword, [password.id]: !showPassword[password.id] })
                                }
                              >
                                {showPassword[password.id] ? (
                                  <EyeOff className="h-3 w-3" />
                                ) : (
                                  <Eye className="h-3 w-3" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => copyToClipboard(password.password)}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>

                          {password.notes && (
                            <div className="mt-2">
                              <span className="text-sm text-muted-foreground">Notes:</span>
                              <p className="text-sm mt-1">{password.notes}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="generator">
          <PasswordGenerator
            onSelectPassword={(password) => {
              setNewEntry({ ...newEntry, password })
              setIsAddDialogOpen(true)
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

