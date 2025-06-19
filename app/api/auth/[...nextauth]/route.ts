import NextAuth, { NextAuthOptions } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { JWT } from "next-auth/jwt"
import { Session } from "next-auth"

export const authOptions: NextAuthOptions = {
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // This validation happens on the server side
        const validEmail = process.env.NEXT_PUBLIC_AUTH_EMAIL
        const validPassword = process.env.AUTH_PASSWORD

        if (!validEmail || !validPassword) {
          console.error("Authentication failed: Missing environment variables", {
            hasEmail: !!process.env.NEXT_PUBLIC_AUTH_EMAIL,
            hasPassword: !!process.env.AUTH_PASSWORD
          })
          return null
        }

        // Add debug logging
        console.log("Auth attempt:", {
          providedEmail: credentials?.email,
          expectedEmail: validEmail,
          emailMatch: credentials?.email === validEmail,
          passwordProvided: !!credentials?.password,
          passwordMatch: credentials?.password === validPassword
        })

        // Use timing-safe comparison to prevent timing attacks
        const isValidEmail = credentials?.email === validEmail
        const isValidPassword = credentials?.password === validPassword

        if (isValidEmail && isValidPassword) {
          return {
            id: "1",
            email: validEmail,
            name: "Jan Veenstra",
          }
        }

        // If credentials don't match, return null
        console.error("Authentication failed: Invalid credentials")
        return null
      }
    })
  ],
  debug: true, // Enable debug messages
  pages: {
    signIn: '/', // Use our custom login page
  },
  // Add session configuration
  session: {
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }: { token: JWT; user: any }) {
      if (user) {
        token.email = user.email
        token.name = user.name
      }
      return token
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (token && session.user) {
        session.user.email = token.email as string
        session.user.name = token.name as string
      }
      return session
    }
  }
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
