"use client"

import { useState } from "react"
import LoginPage from "./components/LoginPage"
import ChatPage from "./components/ChatPage"

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<{ name: string; email: string } | null>(null)

  const handleLogin = (userData: { name: string; email: string }) => {
    setUser(userData)
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    setUser(null)
    setIsAuthenticated(false)
  }

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />
  }

  return <ChatPage user={user} onLogout={handleLogout} />
}
