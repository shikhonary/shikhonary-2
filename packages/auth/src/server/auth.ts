import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { phoneNumber } from "better-auth/plugins"
import { db } from "@workspace/db/main"
import { sendVerificationEmail, sendResetPasswordEmail } from "@workspace/email"
import { sendSms } from "@workspace/sms"

/**
 * Internal email domain used for phone-based registrations.
 * When a student registers with an 11-digit phone number, we generate
 * an internal email like `01712345678@phone.bec.local` so we can reuse
 * Better Auth's email/password signup flow. This email is never shown
 * to the user and is purely an implementation detail.
 */
export const PHONE_EMAIL_DOMAIN = "phone.bec.local"

/**
 * Server-side Better Auth instance.
 *
 * This is the single source of truth for all auth configuration.
 * Import this in your server code (e.g. Next.js route handlers, middleware).
 *
 * The Prisma adapter points at the custom-generated client from
 * packages/db/generated/main — NOT @prisma/client — as required by Prisma 7+.
 */
export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  user: {
    additionalFields: {
      phoneNumber: { type: "string" },
      phoneNumberVerified: { type: "boolean" },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  plugins: [
    phoneNumber({
      sendOTP: async ({ phoneNumber: phone, code }) => {
        console.log(`[DEV OTP] Phone: ${phone} | Code: ${code}`)
        try {
          await sendSms(phone, `Your BEC verification code is ${code}`)
        } catch (error) {
          console.error("ERROR [Better Auth/SMS]: Failed to send SMS OTP:", error)
        }
      },
      sendPasswordResetOTP: async ({ phoneNumber: phone, code }) => {
        console.log(`[DEV RESET OTP] Phone: ${phone} | Code: ${code}`)
        try {
          await sendSms(phone, `Your BEC verification code is ${code}`)
        } catch (error) {
          console.error("ERROR [Better Auth/SMS]: Failed to send reset password SMS OTP:", error)
        }
      },
    }),
  ],
  databaseHooks: {
    verification: {
      create: {
        before: async (verification) => {
          if (verification?.identifier) {
            try {
              const deleted = await db.verification.deleteMany({
                where: {
                  identifier: verification.identifier,
                },
              })
              if (deleted.count > 0) {
                console.log(
                  `[Better Auth/Verification Hook] Cleared ${deleted.count} existing verification record(s) for identifier: ${verification.identifier}`
                )
              }
            } catch (error) {
              console.error(
                `[Better Auth/Verification Hook] Failed to clean existing verification records for identifier ${verification.identifier}:`,
                error
              )
            }
          }
          return { data: verification }
        },
      },
    },
    user: {
      create: {
        after: async (user) => {
          try {
            // Check if this is a phone-based registration
            const isPhoneRegistration = user.email?.endsWith(
              `@${PHONE_EMAIL_DOMAIN}`
            )

            if (isPhoneRegistration) {
              // Extract phone number from the generated email
              const phone = user.email.replace(`@${PHONE_EMAIL_DOMAIN}`, "")
              await db.user.update({
                where: { id: user.id },
                data: {
                  phoneNumber: phone,
                  phoneNumberVerified: false,
                  emailVerified: true, // Skip email verification for phone users
                  roles: {
                    connectOrCreate: {
                      where: { name: "USER" },
                      create: {
                        name: "USER",
                        description: "Default standard user role",
                      },
                    },
                  },
                },
              })
            } else {
              await db.user.update({
                where: { id: user.id },
                data: {
                  roles: {
                    connectOrCreate: {
                      where: { name: "USER" },
                      create: {
                        name: "USER",
                        description: "Default standard user role",
                      },
                    },
                  },
                },
              })
            }
          } catch (error) {
            console.error(
              "ERROR [Better Auth/User]: Failed to process user registration:",
              error
            )
          }
        },
      },
    },
    session: {
      create: {
        before: async (session, ctx) => {
          const body = ctx?.body as { rememberMe?: boolean } | undefined
          const rememberMe = body?.rememberMe

          // If rememberMe is not checked, shorten database session lifetime to 7 days
          if (!rememberMe) {
            const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7)
            return {
              data: {
                ...session,
                expiresAt,
              },
            }
          }

          return { data: session }
        },
      },
    },
  },

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    minPasswordLength: 6,
    sendResetPassword: async ({ user, url, token }) => {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
      const resetUrl = `${appUrl}/auth/reset-password?token=${token}`

      // Check if this is a phone-based user
      if (user.email?.endsWith(`@${PHONE_EMAIL_DOMAIN}`)) {
        const phone = user.email.replace(`@${PHONE_EMAIL_DOMAIN}`, "")

        try {
          console.log(`[DEV RESET SMS LINK] Phone: ${phone} | Link: ${resetUrl}`)
          await sendSms(phone, `Your BEC password reset link: ${resetUrl}`)
        } catch (error) {
          console.error("ERROR [Better Auth/SMS]: Failed to send reset password SMS link:", error)
        }
        return
      }

      const result = await sendResetPasswordEmail({
        to: user.email,
        name: user.name || "User",
        url: resetUrl,
      })

      if (!result.success) {
        console.error(
          "ERROR [Better Auth/Email]: Failed to send reset password email:",
          result.error
        )
      }
    },
  },

  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url }) => {
      console.log(`[Better Auth/Email] sendVerificationEmail triggered for user: ${user.email}`)

      // Skip sending verification email for phone-based registrations
      if (user.email?.endsWith(`@${PHONE_EMAIL_DOMAIN}`)) {
        console.log(`[Better Auth/Email] Skipping verification email for internal phone email: ${user.email}`)
        return
      }

      // Modify callback URL to redirect to /auth/sign-in?verified=true upon successful validation
      const redirectUrl = new URL(url)
      const appUrl = redirectUrl.origin || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
      redirectUrl.searchParams.set(
        "callbackURL",
        `${appUrl}/auth/sign-in?verified=true`
      )

      console.log(`[Better Auth/Email] Dispatching verification email to ${user.email} with URL: ${redirectUrl.toString()}`)

      const result = await sendVerificationEmail({
        to: user.email,
        name: user.name || "User",
        url: redirectUrl.toString(),
      })

      if (!result.success) {
        console.error(
          "ERROR [Better Auth/Email]: Failed to send verification email:",
          result.error
        )
      } else {
        console.log(`[Better Auth/Email] Verification email successfully sent to ${user.email}`)
      }
    },
  },
  // Allow multiple domains to share the same auth package (including localhost:3000 & localhost:3001)
  trustedOrigins: Array.from(
    new Set([
      "http://localhost:3000",
      "http://localhost:3001",
      ...(process.env.TRUSTED_ORIGINS ? process.env.TRUSTED_ORIGINS.split(",") : []),
      ...(process.env.NEXT_PUBLIC_APP_URL ? [process.env.NEXT_PUBLIC_APP_URL] : []),
    ].filter(Boolean))
  ),
})

export type Auth = typeof auth
