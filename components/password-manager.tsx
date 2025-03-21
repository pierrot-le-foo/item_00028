"use client"

import { useState, useEffect } from "react"
import { Search, Plus, MoreHorizontal, ExternalLink, Edit, Trash, Key, Eye, EyeOff, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { PasswordGenerator } from "./password-generator"
import { generatePassword } from "@/lib/password-utils"

interface SavedPassword {
  id: string
  website: string
  url: string
  username: string
  password: string
  lastUsed: string
  favicon?: string
}

export function PasswordManager() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("passwords")
  const [searchTerm, setSearchTerm] = useState("")
  const [savedPasswords, setSavedPasswords] = useState<SavedPassword[]>([])
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({})
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [currentPassword, setCurrentPassword] = useState<SavedPassword | null>(null)
  const [newPassword, setNewPassword] = useState({
    website: "",
    url: "",
    username: "",
    password: "",
  })
  const [copied, setCopied] = useState<Record<string, boolean>>({})

  // Load demo passwords on initial render
  useEffect(() => {
    const demoPasswords: SavedPassword[] = [
      {
        id: "1",
        website: "Google",
        url: "google.com",
        username: "user@example.com",
        password: "StrongP@ssw0rd1",
        lastUsed: "2 days ago",
        favicon: "https://www.google.com/favicon.ico",
      },
      {
        id: "2",
        website: "Twitter",
        url: "twitter.com",
        username: "twitteruser",
        password: "Tw1tterP@ss!",
        lastUsed: "1 week ago",
        favicon: "https://twitter.com/favicon.ico",
      },
      {
        id: "3",
        website: "Example Site",
        url: "example.com",
        username: "demouser",
        password: "Ex@mpleP@ss123",
        lastUsed: "3 days ago",
        favicon: "/placeholder.svg?height=16&width=16",
      },
    ]

    setSavedPasswords(demoPasswords)
  }, [])

  const handleAddPassword = () => {
    if (!newPassword.website || !newPassword.username || !newPassword.password) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please fill in all required fields.",
      })
      return
    }

    const newEntry: SavedPassword = {
      id: Date.now().toString(),
      website: newPassword.website,
      url: newPassword.url,
      username: newPassword.username,
      password: newPassword.password,
      lastUsed: "Just now",
      favicon: `https://${newPassword.url.replace(/^https?:\/\//, "").split("/")[0]}/favicon.ico`,
    }

    setSavedPasswords([newEntry, ...savedPasswords])
    setNewPassword({
      website: "",
      url: "",
      username: "",
      password: "",
    })
    setIsAddDialogOpen(false)

    toast({
      title: "Password saved",
      description: `Password for ${newEntry.website} has been saved.`,
    })
  }

  const handleEditPassword = () => {
    if (!currentPassword) return

    const updatedPasswords = savedPasswords.map((p) => (p.id === currentPassword.id ? currentPassword : p))

    setSavedPasswords(updatedPasswords)
    setIsEditDialogOpen(false)
    setCurrentPassword(null)

    toast({
      title: "Password updated",
      description: `Password for ${currentPassword.website} has been updated.`,
    })
  }

  const handleDeletePassword = (id: string) => {
    const passwordToDelete = savedPasswords.find((p) => p.id === id)
    if (!passwordToDelete) return

    setSavedPasswords(savedPasswords.filter((p) => p.id !== id))

    toast({
      title: "Password deleted",
      description: `Password for ${passwordToDelete.website} has been deleted.`,
    })
  }

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopied({ ...copied, [id]: true })

    toast({
      title: "Copied to clipboard",
      description: "Text has been copied to your clipboard.",
    })

    setTimeout(() => {
      setCopied({ ...copied, [id]: false })
    }, 2000)
  }

  const generateNewPassword = () => {
    const password = generatePassword({
      length: 16,
      uppercase: true,
      lowercase: true,
      numbers: true,
      symbols: true,
    })

    if (isEditDialogOpen && currentPassword) {
      setCurrentPassword({ ...currentPassword, password })
    } else {
      setNewPassword({ ...newPassword, password })
    }

    toast({
      title: "Password generated",
      description: "A strong password has been generated.",
    })
  }

  const filteredPasswords = savedPasswords.filter(
    (p) =>
      p.website.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.url.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center">
          <Key className="mr-2 h-6 w-6 text-primary" />
          Password Manager
        </h1>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="passwords">Passwords</TabsTrigger>
          <TabsTrigger value="generator">Password Generator</TabsTrigger>
        </TabsList>

        <TabsContent value="passwords">
          <div className="flex justify-between items-center mb-4">
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
                  <Plus className="mr-2 h-4 w-4" />
                  Add Password
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Save Password</DialogTitle>
                  <DialogDescription>Add a new password to your Password Manager.</DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={newPassword.website}
                      onChange={(e) => setNewPassword({ ...newPassword, website: e.target.value })}
                      placeholder="Google"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="url">URL</Label>
                    <Input
                      id="url"
                      value={newPassword.url}
                      onChange={(e) => setNewPassword({ ...newPassword, url: e.target.value })}
                      placeholder="google.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="username">Username or Email</Label>
                    <Input
                      id="username"
                      value={newPassword.username}
                      onChange={(e) => setNewPassword({ ...newPassword, username: e.target.value })}
                      placeholder="user@example.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="flex">
                      <Input
                        id="password"
                        type={showPassword.new ? "text" : "password"}
                        value={newPassword.password}
                        onChange={(e) => setNewPassword({ ...newPassword, password: e.target.value })}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="ml-2"
                        onClick={() => setShowPassword({ ...showPassword, new: !showPassword.new })}
                      >
                        {showPassword.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    <div className="flex justify-between mt-1">
                      <Button variant="link" className="h-auto p-0 text-xs" onClick={() => setActiveTab("generator")}>
                        Open password generator
                      </Button>
                      <Button variant="link" className="h-auto p-0 text-xs" onClick={generateNewPassword}>
                        Generate password
                      </Button>
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddPassword}>Save</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {filteredPasswords.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <Key className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">
                  {searchTerm ? "No passwords match your search." : "No saved passwords yet."}
                </p>
                {!searchTerm && (
                  <Button variant="link" onClick={() => setIsAddDialogOpen(true)} className="mt-2">
                    Add your first password
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {filteredPasswords.map((password) => (
                <div
                  key={password.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mr-3 overflow-hidden">
                      {password.favicon ? (
                        <img
                          src={password.favicon || "/placeholder.svg"}
                          alt={password.website}
                          className="w-6 h-6"
                          onError={(e) => {
                            e.currentTarget.src = `/placeholder.svg?height=24&width=24`
                          }}
                        />
                      ) : (
                        <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold">
                          {password.website.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium">{password.website}</h3>
                      <p className="text-sm text-muted-foreground">{password.username}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <span className="text-xs text-muted-foreground mr-4">{password.lastUsed}</span>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => copyToClipboard(password.password, password.id)}
                        title="Copy password"
                      >
                        {copied[password.id] ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => window.open(`https://${password.url.replace(/^https?:\/\//, "")}`, "_blank")}
                        title="Go to website"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setCurrentPassword(password)
                              setIsEditDialogOpen(true)
                            }}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeletePassword(password.id)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            {currentPassword && (
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Password</DialogTitle>
                  <DialogDescription>Update your saved password details.</DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-website">Website</Label>
                    <Input
                      id="edit-website"
                      value={currentPassword.website}
                      onChange={(e) => setCurrentPassword({ ...currentPassword, website: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-url">URL</Label>
                    <Input
                      id="edit-url"
                      value={currentPassword.url}
                      onChange={(e) => setCurrentPassword({ ...currentPassword, url: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-username">Username or Email</Label>
                    <Input
                      id="edit-username"
                      value={currentPassword.username}
                      onChange={(e) => setCurrentPassword({ ...currentPassword, username: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-password">Password</Label>
                    <div className="flex">
                      <Input
                        id="edit-password"
                        type={showPassword[currentPassword.id] ? "text" : "password"}
                        value={currentPassword.password}
                        onChange={(e) => setCurrentPassword({ ...currentPassword, password: e.target.value })}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="ml-2"
                        onClick={() =>
                          setShowPassword({ ...showPassword, [currentPassword.id]: !showPassword[currentPassword.id] })
                        }
                      >
                        {showPassword[currentPassword.id] ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <Button variant="link" className="h-auto p-0 text-xs mt-1" onClick={generateNewPassword}>
                      Generate new password
                    </Button>
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleEditPassword}>Save Changes</Button>
                </DialogFooter>
              </DialogContent>
            )}
          </Dialog>
        </TabsContent>

        <TabsContent value="generator">
          <PasswordGenerator
            onSelectPassword={(password) => {
              setNewPassword({ ...newPassword, password })
              setActiveTab("passwords")
              setIsAddDialogOpen(true)
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

