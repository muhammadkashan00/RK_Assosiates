import { User } from "../models/User.js"
import { asyncHandler } from "../middleware/error.js"
import { signToken } from "../middleware/auth.js"

const MAX_FAILED = 5
const LOCK_MINUTES = 15

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body || {}
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." })
  }

  const user = await User.findOne({ email: String(email).toLowerCase().trim() })
  // Generic message to avoid revealing which field was wrong.
  const invalid = () => res.status(401).json({ message: "Invalid credentials." })

  if (!user) return invalid()

  if (user.isLocked) {
    return res.status(423).json({
      message: "Account temporarily locked due to failed attempts. Try again later.",
    })
  }

  const ok = await user.verifyPassword(password)
  if (!ok) {
    user.failedAttempts = (user.failedAttempts || 0) + 1
    if (user.failedAttempts >= MAX_FAILED) {
      user.lockUntil = new Date(Date.now() + LOCK_MINUTES * 60 * 1000)
      user.failedAttempts = 0
    }
    await user.save()
    return invalid()
  }

  user.failedAttempts = 0
  user.lockUntil = undefined
  user.lastLogin = new Date()
  await user.save()

  const token = signToken({ sub: user._id.toString(), email: user.email })
  res.json({ token, user: { id: user._id, email: user.email } })
})

export const logout = asyncHandler(async (_req, res) => {
  // Stateless JWT: client discards the token. Endpoint kept for symmetry.
  res.json({ ok: true })
})

export const me = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select("email")
  if (!user) return res.status(401).json({ message: "Not authenticated." })
  res.json({ user: { id: user._id, email: user.email } })
})
