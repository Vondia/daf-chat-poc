import { withAuth } from "next-auth/middleware"

export default withAuth({
  pages: {
    signIn: "/",
  },
})

// Configure which paths should be handled by the middleware
export const config = { matcher: ["/chat", "/api/chat"] }
