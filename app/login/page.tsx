"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Lock, Mail } from "lucide-react"
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid credentials')
      } else {
        // Redirect to the chat page on successful login
        router.push('/')
      }
    } catch (error) {
      setError('An error occurred during login')
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/daf-trucks-bg.jpg')",
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        {/* Add floating elements for visual interest */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-white bg-opacity-10 rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-16 h-16 bg-daf-red bg-opacity-20 rounded-full animate-bounce"></div>
        <div
          className="absolute top-1/3 right-10 w-12 h-12 bg-daf-blue bg-opacity-15 rounded-full animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div className="w-full max-w-md">
          <Card className="shadow-2xl border-0 bg-white bg-opacity-95 backdrop-blur-sm">
            <CardHeader className="space-y-1 pb-6">
              <div className="flex items-center justify-center mb-6">
                <img src="/daf-logo.svg" alt="DAF Logo" className="h-16 w-auto" />
              </div>
              <div className="flex items-center justify-center mb-4">
                <Lock className="h-6 w-6 text-daf-blue mr-2" />
                <CardTitle className="text-2xl font-semibold text-gray-900">Login</CardTitle>
              </div>
              <CardDescription className="text-center text-gray-600">Access to DAF Sales Agent</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="text-red-500 text-center">{error}</div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="your.email@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 border-gray-300 focus:border-daf-blue focus:ring-daf-blue"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 border-gray-300 focus:border-daf-blue focus:ring-daf-blue"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-daf-red hover:bg-red-700 text-white font-medium py-2.5 transition-colors duration-200"
                >
                  Login
                </Button>
              </form>

              <div className="mt-6 text-center space-y-2">
                <p className="text-xs text-gray-500">
                  By logging in, you agree to our{" "}
                  <a
                    href="https://www.daf.com/nl-nl/legal/de-algemene-voorwaarden"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-daf-blue hover:underline"
                  >
                    Terms and Conditions
                  </a>
                </p>
                <p className="text-sm text-gray-500">© 2025 DAF Trucks N.V. All rights reserved.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
