import { withAuth } from "next-auth/middleware"

export default withAuth({
  pages: {
    signIn: "/login",
  },
})

// Configure which paths should be handled by the middleware
export const config = {
  matcher: ["/((?!login|_next/static|_next/image|favicon.ico|.*\\.(?:jpg|jpeg|gif|png|svg|ico)$).*)"],
}
