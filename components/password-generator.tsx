"use client"

import { useState, useEffect } from "react"
import { Copy, RefreshCw, Check, Shield, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"
import { generatePassword, calculatePasswordStrength } from "@/lib/password-utils"

interface PasswordGeneratorProps {
  onSelectPassword?: (password: string) => void
  onClose?: () => void
}

export function PasswordGenerator({ onSelectPassword, onClose }: PasswordGeneratorProps) {
  const { toast } = useToast()
  const [password, setPassword] = useState("")
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [length, setLength] = useState(16)
  const [includeUppercase, setIncludeUppercase] = useState(true)
  const [includeLowercase, setIncludeLowercase] = useState(true)
  const [includeNumbers, setIncludeNumbers] = useState(true)
  const [includeSymbols, setIncludeSymbols] = useState(true)
  const [copied, setCopied] = useState(false)

  // Generate password when options change
  useEffect(() => {
    handleGeneratePassword()
  }, [length, includeUppercase, includeLowercase, includeNumbers, includeSymbols])

  // Calculate password strength when password changes
  useEffect(() => {
    if (password) {
      setPasswordStrength(calculatePasswordStrength(password))
    }
  }, [password])

  const handleGeneratePassword = () => {
    const newPassword = generatePassword({
      length,
      uppercase: includeUppercase,
      lowercase: includeLowercase,
      numbers: includeNumbers,
      symbols: includeSymbols,
    })
    setPassword(newPassword)
    setCopied(false)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(password)
    setCopied(true)
    toast({
      title: "Password Copied",
      description: "Password has been copied to clipboard",
    })
    setTimeout(() => setCopied(false), 2000)
  }

  const getStrengthLabel = (strength: number) => {
    if (strength < 30) return { label: "Weak", color: "bg-red-500" }
    if (strength < 60) return { label: "Moderate", color: "bg-yellow-500" }
    if (strength < 80) return { label: "Strong", color: "bg-green-500" }
    return { label: "Very Strong", color: "bg-green-700" }
  }

  const strengthInfo = getStrengthLabel(passwordStrength)

  return (
    <Card className="w-full relative">
      {onClose && (
        <Button variant="ghost" size="icon" className="absolute right-2 top-2" onClick={onClose} aria-label="Close">
          <X className="h-4 w-4" />
        </Button>
      )}
      <CardHeader className="pb-4 pt-6 px-6">
        <CardTitle className="flex items-center">
          <Shield className="mr-2 h-5 w-5" />
          Password Generator
        </CardTitle>
        <CardDescription>Create strong, secure passwords for your accounts</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 px-6 pb-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Generated Password</Label>
            <Button variant="ghost" size="sm" onClick={handleGeneratePassword} className="h-8 px-2">
              <RefreshCw className="h-3.5 w-3.5 mr-1" />
              Regenerate
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            <div className="bg-muted p-3 rounded-md flex-1 font-mono text-sm overflow-x-auto">{password}</div>
            <Button variant="outline" size="icon" onClick={copyToClipboard} disabled={!password}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>

          <div className="space-y-1 mt-2">
            <div className="flex justify-between text-xs">
              <span>Password Strength</span>
              <span>{strengthInfo.label}</span>
            </div>
            <Progress value={passwordStrength} className={strengthInfo.color} />
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="length">Length: {length}</Label>
            </div>
            <Slider
              id="length"
              min={8}
              max={32}
              step={1}
              value={[length]}
              onValueChange={(value) => setLength(value[0])}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="uppercase">Uppercase Letters (A-Z)</Label>
              <Switch
                id="uppercase"
                checked={includeUppercase}
                onCheckedChange={setIncludeUppercase}
                disabled={!includeLowercase && !includeNumbers && !includeSymbols}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="lowercase">Lowercase Letters (a-z)</Label>
              <Switch
                id="lowercase"
                checked={includeLowercase}
                onCheckedChange={setIncludeLowercase}
                disabled={!includeUppercase && !includeNumbers && !includeSymbols}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="numbers">Numbers (0-9)</Label>
              <Switch
                id="numbers"
                checked={includeNumbers}
                onCheckedChange={setIncludeNumbers}
                disabled={!includeUppercase && !includeLowercase && !includeSymbols}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="symbols">Symbols (!@#$%^&*)</Label>
              <Switch
                id="symbols"
                checked={includeSymbols}
                onCheckedChange={setIncludeSymbols}
                disabled={!includeUppercase && !includeLowercase && !includeNumbers}
              />
            </div>
          </div>
        </div>
      </CardContent>
      {onSelectPassword && (
        <CardFooter className="px-6 pb-6">
          <div className="flex w-full gap-2">
            {onClose && (
              <Button variant="outline" className="flex-1" onClick={onClose}>
                Cancel
              </Button>
            )}
            <Button className="flex-1" onClick={() => onSelectPassword(password)}>
              Use This Password
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  )
}

