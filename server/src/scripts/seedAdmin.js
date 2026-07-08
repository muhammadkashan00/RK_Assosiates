import "../config/env.js"
import mongoose from "mongoose"
import { connectDB } from "../config/db.js"
import { env } from "../config/env.js"
import { User } from "../models/User.js"

function generatePassword() {
  // Strong random password if none provided (min 8, mixed).
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*"
  let pw = ""
  for (let i = 0; i < 14; i++) pw += chars[Math.floor(Math.random() * chars.length)]
  return pw
}

async function run() {
  await connectDB()

  const username = (env.SEED_ADMIN_USERNAME || "admin").toLowerCase().trim()
  let password = env.SEED_ADMIN_PASSWORD
  let generated = false
  if (!password) {
    password = generatePassword()
    generated = true
  }

  const passwordHash = await User.hashPassword(password)

  const existing = await User.findOne({ username })
  if (existing) {
    existing.passwordHash = passwordHash
    existing.failedAttempts = 0
    existing.lockUntil = undefined
    await existing.save()
    console.log(`[seed] Updated existing admin user "${username}".`)
  } else {
    await User.create({ username, passwordHash })
    console.log(`[seed] Created admin user "${username}".`)
  }

  console.log("------------------------------------------------------")
  console.log(`  Admin username: ${username}`)
  if (generated) {
    console.log(`  Admin password: ${password}`)
    console.log("  (Save this now - it will not be shown again.)")
  } else {
    console.log("  Admin password: (from SEED_ADMIN_PASSWORD env var)")
  }
  console.log("------------------------------------------------------")

  await mongoose.disconnect()
  process.exit(0)
}

run().catch((err) => {
  console.error("[seed] Error:", err)
  process.exit(1)
})
