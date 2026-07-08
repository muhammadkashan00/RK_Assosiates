import "../config/env.js"
import mongoose from "mongoose"
import { connectDB } from "../config/db.js"
import { env } from "../config/env.js"
import { User } from "../models/User.js"

function generatePassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*"
  let pw = ""
  for (let i = 0; i < 14; i++) pw += chars[Math.floor(Math.random() * chars.length)]
  return pw
}

async function run() {
  await connectDB()

  const email = (env.SEED_ADMIN_EMAIL || "admin@rkassociates.com").toLowerCase().trim()
  let password = env.SEED_ADMIN_PASSWORD
  let generated = false
  if (!password) {
    password = generatePassword()
    generated = true
  }

  const passwordHash = await User.hashPassword(password)

  const existing = await User.findOne({ email })
  if (existing) {
    existing.passwordHash = passwordHash
    existing.failedAttempts = 0
    existing.lockUntil = undefined
    await existing.save()
    console.log(`[seed] Updated existing admin user "${email}".`)
  } else {
    await User.create({ email, passwordHash })
    console.log(`[seed] Created admin user "${email}".`)
  }

  console.log("------------------------------------------------------")
  console.log(`  Admin email:    ${email}`)
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
