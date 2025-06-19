"use client"
import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { LogOut, Send, Bot, User, MessageSquare } from "lucide-react"

interface ChatPageProps {
  user: { name: string; email: string } | null
  onLogout: () => void
}

export default function ChatPage({ user, onLogout }: ChatPageProps) {
  const [messages, setMessages] = useState<Array<{ id: string; role: string; content: string }>>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message immediately
    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim()
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          threadId: null // or maintain threadId if needed
        })
      });

      const assistantMessage = await response.json();
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  console.log("Chat messages:", messages);
  messages.forEach(m => console.log(m.role, m.content));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img src="/daf-logo.svg" alt="DAF Logo" className="h-8 w-auto mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900">Sales Agent</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-daf-blue text-white text-sm">
                  {user?.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <Button variant="outline" size="sm" onClick={onLogout} className="border-gray-300 hover:bg-gray-50">
                <LogOut className="h-4 w-4 mr-2" />
                Uitloggen
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 h-[calc(100vh-4rem)] relative">
        {/* Enhanced Background with DAF trucks */}
        <div className="absolute inset-0 -m-4 overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat transform scale-105"
            style={{
              backgroundImage: "url('/daf-trucks-bg.jpg')",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-transparent to-red-900/20"></div>
            <div className="absolute inset-0 bg-white/85 backdrop-blur-[2px]"></div>
          </div>

          {/* Decorative elements */}
          <div className="absolute top-10 left-10 w-32 h-32 bg-daf-red/10 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-24 h-24 bg-daf-blue/10 rounded-full blur-lg animate-bounce"></div>
          <div
            className="absolute top-1/3 right-10 w-20 h-20 bg-daf-red/5 rounded-full blur-md animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
        </div>

        <Card className="max-w-4xl mx-auto h-full flex flex-col shadow-2xl relative z-10 bg-white/95 backdrop-blur-sm border-0">
          <CardHeader className="bg-gradient-to-r from-daf-red via-red-600 to-daf-red text-white rounded-t-lg relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>
            <div className="flex items-center relative z-10">
              <Bot className="h-6 w-6 mr-3" />
              <div>
                <h2 className="text-lg font-semibold">DAF Sales Agent</h2>
                <p className="text-sm opacity-90">Uw persoonlijke assistent voor DAF trucks en diensten</p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col p-0 bg-gradient-to-b from-gray-50/50 to-white/80">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 && (
                <div className="text-center py-12 relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-daf-blue/5 to-daf-red/5 rounded-xl blur-3xl"></div>
                  <div className="relative z-10">
                    <MessageSquare className="h-12 w-12 text-daf-blue mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Welkom bij de DAF Sales Agent</h3>
                    <p className="text-gray-600 max-w-md mx-auto">
                      Ik help u graag met vragen over DAF trucks, configuraties, prijzen en diensten. Stel gerust uw
                      vraag!
                    </p>
                  </div>
                </div>
              )}

              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`flex max-w-xs lg:max-w-md ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                  >
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarFallback
                        className={message.role === "user" ? "bg-daf-blue text-white" : "bg-daf-red text-white"}
                      >
                        {message.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={`mx-3 p-3 rounded-lg shadow-sm ${
                        message.role === "user"
                          ? "bg-daf-blue text-white"
                          : "bg-white/90 backdrop-blur-sm border border-gray-200 text-gray-900"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-daf-red text-white">
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="mx-3 p-3 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg shadow-sm">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-daf-red rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-daf-red rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-daf-red rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="border-t border-gray-200/50 p-4 bg-white/80 backdrop-blur-sm">
              <form onSubmit={handleSubmit} className="flex space-x-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Stel uw vraag over DAF trucks..."
                  className="flex-1 border-gray-300 focus:border-daf-blue focus:ring-daf-blue bg-white/90 backdrop-blur-sm"
                  disabled={isLoading}
                />
                <Button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="bg-daf-red hover:bg-red-700 text-white px-6 shadow-lg"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
              <p className="text-xs text-gray-500 mt-2 text-center">
                De DAF Sales Agent kan fouten maken. Controleer belangrijke informatie.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
