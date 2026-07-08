import { User } from "../models/User.js"
import { asyncHandler } from "../middleware/error.js"
import { signToken, cookieOptions, TOKEN_COOKIE } from "../middleware/auth.js"

const MAX_FAILED = 5
const LOCK_MINUTES = 15

export const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body || {}
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required." })
  }

  const user = await User.findOne({ username: String(username).toLowerCase().trim() })
  // Generic message to avoid revealing which field was wrong.
  const invalid = () => res.status(401).json({ error: "Invalid credentials." })

  if (!user) return invalid()

  if (user.isLocked) {
    return res.status(423).json({
      error: "Account temporarily locked due to failed attempts. Try again later.",
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

  const token = signToken({ sub: user._id.toString(), username: user.username })
  res.cookie(TOKEN_COOKIE, token, cookieOptions())
  res.json({ user: { id: user._id, username: user.username, lastLogin: user.lastLogin } })
})

export const logout = asyncHandler(async (req, res) => {
  res.clearCookie(TOKEN_COOKIE, { ...cookieOptions(), maxAge: 0 })
  res.json({ ok: true })
})

export const me = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select("username lastLogin")
  if (!user) return res.status(401).json({ error: "Not authenticated." })
  res.json({ user: { id: user._id, username: user.username, lastLogin: user.lastLogin } })
})
