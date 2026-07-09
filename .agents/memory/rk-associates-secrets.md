---
name: RK Associates secrets limitation
description: Why app credentials remain in [userenv.shared] and what happens if you delete them
---

# RK Associates secrets limitation

The 6 app credentials (MONGODB_CONNECTION_STRING, JWT_SECRET, CLOUDINARY_×3, WHATSAPP_NUMBER) live in `.replit` under `[userenv.shared]` as plaintext.

**Why:** Replit's `setEnvVars` always writes to `[userenv.shared]` in `.replit`. Encrypted Replit Secrets require the user to type them manually via `requestEnvVar` (which blocks agent execution). There is no programmatic path to promote env vars to encrypted secrets.

**How to apply:**
- Do NOT call `deleteEnvVars` on these keys unless the user has first entered them as Replit Secrets via the Secrets UI tab.
- If you delete them and the api-server restarts, it will fail with "MONGODB_CONNECTION_STRING is not configured" because the encrypted Secrets store does not have them.
- The code reviewer flags this as a security issue (plaintext in tracked file). Use `skip_validation_reason` explaining this platform constraint.
- Proper fix: user opens Replit Secrets panel, enters all 6 values, then agent calls `deleteEnvVars` to clean up `[userenv.shared]`.
