"use client"

import { useState, useEffect } from "react"
import { Search, Plus, MoreHorizontal, ExternalLink, Edit, Trash, Key, Eye, EyeOff, Check, Copy } from "lucide-react"
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"
import { PasswordGenerator } from "./password-generator"
import { generatePassword, calculatePasswordStrength } from "@/lib/password-utils"
import { Progress } from "@/components/ui/progress"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

interface SavedPassword {
  id: string
  website: string
  url: string
  username: string
  password: string
  lastUsed: string
  favicon?: string
}

// Form validation schema
const passwordFormSchema = z.object({
  website: z.string().min(1, { message: "Website name is required" }),
  url: z.string().min(1, { message: "URL is required" }),
  username: z.string().min(1, { message: "Username or email is required" }),
  password: z.string().min(1, { message: "Password is required" }),
})

type PasswordFormValues = z.infer<typeof passwordFormSchema>

export function PasswordManager() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("passwords")
  const [searchTerm, setSearchTerm] = useState("")
  const [savedPasswords, setSavedPasswords] = useState<SavedPassword[]>([])
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({})
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [passwordToDelete, setPasswordToDelete] = useState<SavedPassword | null>(null)
  const [currentPassword, setCurrentPassword] = useState<SavedPassword | null>(null)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [copied, setCopied] = useState<Record<string, boolean>>({})
  const [deletedPassword, setDeletedPassword] = useState<SavedPassword | null>(null)

  // Form for adding new passwords
  const addForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      website: "",
      url: "",
      username: "",
      password: "",
    },
  })

  // Form for editing passwords
  const editForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      website: "",
      url: "",
      username: "",
      password: "",
    },
  })

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

  // Update password strength when password changes in add form
  useEffect(() => {
    const password = addForm.watch("password")
    if (password) {
      setPasswordStrength(calculatePasswordStrength(password))
    } else {
      setPasswordStrength(0)
    }
  }, [addForm.watch("password")])

  // Update password strength when password changes in edit form
  useEffect(() => {
    const password = editForm.watch("password")
    if (password) {
      setPasswordStrength(calculatePasswordStrength(password))
    } else {
      setPasswordStrength(0)
    }
  }, [editForm.watch("password")])

  // Set edit form values when current password changes
  useEffect(() => {
    if (currentPassword) {
      editForm.reset({
        website: currentPassword.website,
        url: currentPassword.url,
        username: currentPassword.username,
        password: currentPassword.password,
      })
    }
  }, [currentPassword, editForm])

  const handleAddPassword = (data: PasswordFormValues) => {
    const newEntry: SavedPassword = {
      id: Date.now().toString(),
      website: data.website,
      url: data.url,
      username: data.username,
      password: data.password,
      lastUsed: "Just now",
      favicon: `https://${data.url.replace(/^https?:\/\//, "").split("/")[0]}/favicon.ico`,
    }

    setSavedPasswords([newEntry, ...savedPasswords])
    addForm.reset()
    setIsAddDialogOpen(false)

    toast({
      title: "Password saved",
      description: `Password for ${newEntry.website} has been saved.`,
    })
  }

  const handleEditPassword = (data: PasswordFormValues) => {
    if (!currentPassword) return

    const updatedPassword = {
      ...currentPassword,
      website: data.website,
      url: data.url,
      username: data.username,
      password: data.password,
    }

    const updatedPasswords = savedPasswords.map((p) => (p.id === currentPassword.id ? updatedPassword : p))

    setSavedPasswords(updatedPasswords)
    setIsEditDialogOpen(false)
    setCurrentPassword(null)

    toast({
      title: "Password updated",
      description: `Password for ${data.website} has been updated.`,
    })
  }

  const confirmDeletePassword = (password: SavedPassword) => {
    setPasswordToDelete(password)
    setIsDeleteDialogOpen(true)
  }

  const handleDeletePassword = () => {
    if (!passwordToDelete) return

    // Store the deleted password for potential undo
    const passwordToRestore = { ...passwordToDelete }

    // Remove from the list
    setSavedPasswords(savedPasswords.filter((p) => p.id !== passwordToDelete.id))

    // Close dialog
    setIsDeleteDialogOpen(false)
    setPasswordToDelete(null)

    // Show toast with undo option
    toast({
      title: "Password deleted",
      description: `Password for ${passwordToRestore.website} has been deleted.`,
      action: (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            // Add the password back to the list
            setSavedPasswords((prev) => [...prev, passwordToRestore])

            // Show confirmation toast
            toast({
              title: "Password restored",
              description: `Password for ${passwordToRestore.website} has been restored.`,
            })
          }}
        >
          Undo
        </Button>
      ),
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

    if (isEditDialogOpen) {
      editForm.setValue("password", password)
    } else {
      addForm.setValue("password", password)
    }

    toast({
      title: "Password generated",
      description: "A strong password has been generated.",
    })
  }

  const handlePasswordItemClick = (password: SavedPassword) => {
    // Toggle password visibility instead of copying
    setShowPassword((prev) => ({
      ...prev,
      [password.id]: !prev[password.id],
    }))
  }

  const getStrengthLabel = (strength: number) => {
    if (strength < 30) return { label: "Weak", color: "bg-red-500" }
    if (strength < 60) return { label: "Moderate", color: "bg-yellow-500" }
    if (strength < 80) return { label: "Strong", color: "bg-green-500" }
    return { label: "Very Strong", color: "bg-green-700" }
  }

  const strengthInfo = getStrengthLabel(passwordStrength)

  const filteredPasswords = savedPasswords.filter(
    (p) =>
      p.website.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.url.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6 max-w-4xl">
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
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
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
                <Button className="whitespace-nowrap">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Password
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Save Password</DialogTitle>
                  <DialogDescription>Add a new password to your Password Manager.</DialogDescription>
                </DialogHeader>

                <Form {...addForm}>
                  <form onSubmit={addForm.handleSubmit(handleAddPassword)} className="space-y-4 py-4">
                    <FormField
                      control={addForm.control}
                      name="website"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Website</FormLabel>
                          <FormControl>
                            <Input placeholder="Google" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={addForm.control}
                      name="url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>URL</FormLabel>
                          <FormControl>
                            <Input placeholder="google.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={addForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username or Email</FormLabel>
                          <FormControl>
                            <Input placeholder="user@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={addForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <div className="space-y-2">
                            <div className="flex">
                              <FormControl>
                                <Input type={showPassword.new ? "text" : "password"} className="flex-1" {...field} />
                              </FormControl>
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

                            <div className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span>Password Strength</span>
                                <span>{strengthInfo.label}</span>
                              </div>
                              <Progress value={passwordStrength} className={strengthInfo.color} />
                            </div>

                            <div className="flex justify-between mt-1">
                              <Button
                                type="button"
                                variant="link"
                                className="h-auto p-0 text-xs"
                                onClick={() => {
                                  setIsAddDialogOpen(false)
                                  setActiveTab("generator")
                                }}
                              >
                                Open password generator
                              </Button>
                              <Button
                                type="button"
                                variant="link"
                                className="h-auto p-0 text-xs"
                                onClick={generateNewPassword}
                              >
                                Generate password
                              </Button>
                            </div>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <DialogFooter className="mt-6">
                      <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">Save</Button>
                    </DialogFooter>
                  </form>
                </Form>
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
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer relative"
                  onClick={() => handlePasswordItemClick(password)}
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
                      {showPassword[password.id] && (
                        <div className="mt-1 font-mono text-sm bg-muted p-1.5 rounded">{password.password}</div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center">
                    <span className="text-xs text-muted-foreground mr-4">{password.lastUsed}</span>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation()
                          setShowPassword((prev) => ({
                            ...prev,
                            [password.id]: !prev[password.id],
                          }))
                        }}
                        title={showPassword[password.id] ? "Hide password" : "Show password"}
                        className="relative"
                      >
                        {showPassword[password.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        {showPassword[password.id] && (
                          <span className="absolute -bottom-1 -right-1 w-2 h-2 bg-primary rounded-full"></span>
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation()
                          copyToClipboard(password.password, password.id)
                        }}
                        title="Copy password"
                        className="relative"
                      >
                        {copied[password.id] ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation()
                          window.open(`https://${password.url.replace(/^https?:\/\//, "")}`, "_blank")
                        }}
                        title="Go to website"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation()
                              setCurrentPassword(password)
                              setIsEditDialogOpen(true)
                            }}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation()
                              confirmDeletePassword(password)
                            }}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* Hover indicator */}
                  <div className="absolute inset-0 bg-primary/5 opacity-0 hover:opacity-100 rounded-lg pointer-events-none transition-opacity"></div>
                </div>
              ))}
            </div>
          )}

          {/* Edit Password Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            {currentPassword && (
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Edit Password</DialogTitle>
                  <DialogDescription>Update your saved password details.</DialogDescription>
                </DialogHeader>

                <Form {...editForm}>
                  <form onSubmit={editForm.handleSubmit(handleEditPassword)} className="space-y-4 py-4">
                    <FormField
                      control={editForm.control}
                      name="website"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Website</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={editForm.control}
                      name="url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>URL</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={editForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username or Email</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={editForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <div className="space-y-2">
                            <div className="flex">
                              <FormControl>
                                <Input
                                  type={showPassword[currentPassword.id] ? "text" : "password"}
                                  className="flex-1"
                                  {...field}
                                />
                              </FormControl>
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="ml-2"
                                onClick={() =>
                                  setShowPassword({
                                    ...showPassword,
                                    [currentPassword.id]: !showPassword[currentPassword.id],
                                  })
                                }
                              >
                                {showPassword[currentPassword.id] ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </Button>
                            </div>

                            <div className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span>Password Strength</span>
                                <span>{strengthInfo.label}</span>
                              </div>
                              <Progress value={passwordStrength} className={strengthInfo.color} />
                            </div>

                            <Button
                              type="button"
                              variant="link"
                              className="h-auto p-0 text-xs mt-1"
                              onClick={generateNewPassword}
                            >
                              Generate new password
                            </Button>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <DialogFooter className="mt-6">
                      <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">Save Changes</Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            )}
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will delete the password for {passwordToDelete?.website}. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeletePassword}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </TabsContent>

        <TabsContent value="generator">
          <div className="max-w-md mx-auto">
            <PasswordGenerator
              onSelectPassword={(password) => {
                addForm.setValue("password", password)
                setActiveTab("passwords")
                setIsAddDialogOpen(true)
              }}
              onClose={() => setActiveTab("passwords")}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

