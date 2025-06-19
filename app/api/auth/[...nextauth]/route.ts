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
        // Check if credentials match environment variables
        const validEmail = process.env.NEXT_PUBLIC_AUTH_EMAIL
        const validPassword = process.env.AUTH_PASSWORD

        if (!validEmail || !validPassword) {
          throw new Error("Please set up AUTH_EMAIL and AUTH_PASSWORD environment variables")
        }

        if (credentials?.email === validEmail && credentials?.password === validPassword) {
          return {
            id: "1",
            email: credentials.email,
            name: "Jan Veenstra",
          }
        }

        // If credentials don't match, return null
        return null
      }
    })
  ],
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
