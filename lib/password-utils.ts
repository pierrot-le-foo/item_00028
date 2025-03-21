interface PasswordOptions {
  length: number
  uppercase: boolean
  lowercase: boolean
  numbers: boolean
  symbols: boolean
}

export function generatePassword(options: PasswordOptions): string {
  const uppercaseChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  const lowercaseChars = "abcdefghijklmnopqrstuvwxyz"
  const numberChars = "0123456789"
  const symbolChars = "!@#$%^&*()_-+=<>?/"

  let chars = ""
  let password = ""

  // Add character sets based on options
  if (options.uppercase) chars += uppercaseChars
  if (options.lowercase) chars += lowercaseChars
  if (options.numbers) chars += numberChars
  if (options.symbols) chars += symbolChars

  // Ensure at least one character set is selected
  if (chars.length === 0) {
    chars = lowercaseChars + numberChars
  }

  // Generate the password
  for (let i = 0; i < options.length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length)
    password += chars[randomIndex]
  }

  // Ensure the password contains at least one character from each selected set
  let validPassword = true

  if (options.uppercase && !/[A-Z]/.test(password)) validPassword = false
  if (options.lowercase && !/[a-z]/.test(password)) validPassword = false
  if (options.numbers && !/[0-9]/.test(password)) validPassword = false
  if (options.symbols && !/[!@#$%^&*()_\-+=<>?/]/.test(password)) validPassword = false

  // If the password doesn't meet requirements, generate a new one
  if (!validPassword) {
    return generatePassword(options)
  }

  return password
}

export function calculatePasswordStrength(password: string): number {
  if (!password) return 0

  let score = 0

  // Length check
  if (password.length >= 8) score += 1
  if (password.length >= 12) score += 1
  if (password.length >= 16) score += 1

  // Character variety checks
  if (/[A-Z]/.test(password)) score += 1 // Has uppercase
  if (/[a-z]/.test(password)) score += 1 // Has lowercase
  if (/[0-9]/.test(password)) score += 1 // Has numbers
  if (/[^A-Za-z0-9]/.test(password)) score += 1 // Has symbols

  // Check for common patterns
  if (!/^[a-zA-Z]+$/.test(password)) score += 1 // Not just letters
  if (!/^[0-9]+$/.test(password)) score += 1 // Not just numbers

  // Normalize score to 0-100
  return Math.min(Math.floor((score / 10) * 100), 100)
}

