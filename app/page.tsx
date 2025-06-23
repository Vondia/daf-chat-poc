"use client"
import { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { LogOut, Send, Bot, User, MessageSquare, Link as LinkIcon } from "lucide-react"
import { signOut } from "next-auth/react"
import ReactMarkdown from 'react-markdown'

interface ChatPageProps {
  user: {
    name?: string | null;
    email?: string | null;
  } | null;
}

interface Citation {
  startIndex: number;
  endIndex: number;
  content: string;
  title?: string;
  url?: string;
  fileId?: string;
  fileName?: string;
}

interface Attachment {
  mimeType: string;
  data: string;
}

interface Message {
  id: string;
  role: string;
  content: string;
  isMarkdown?: boolean;
  citations?: Citation[];
  attachments?: Attachment[];
}

function cleanContent(content: string): string {
  // Remove citation markers like †source and †bron
  return content.replace(/†source/g, '').replace(/†bron/g, '');
}

function deduplicateCitations(citations: Citation[]): Citation[] {
  const seen = new Set<string>();
  return citations
    .filter(citation => {
      const key = `${citation.content} ${citation.fileName}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    })
    .sort((a, b) => {
      // Extract numbers from citation content (e.g., [4:13] -> [4, 13])
      const getNumbers = (content: string) => {
        const match = content.match(/\[?(\d+):(\d+)\]?/);
        return match ? [parseInt(match[1]), parseInt(match[2])] : [0, 0];
      };

      const [aMain, aSub] = getNumbers(a.content);
      const [bMain, bSub] = getNumbers(b.content);

      // Sort by main number first, then by sub-number
      if (aMain !== bMain) {
        return aMain - bMain;
      }
      return aSub - bSub;
    });
}

export default function HomePage({ user }: ChatPageProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const onLogout = () => {
    signOut()
  }

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

  return (
    <div className="grid grid-rows-[auto_1fr] h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <img src="/daf-logo.svg" alt="DAF Logo" className="h-8 w-auto mr-3" />
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-daf-blue text-white text-sm">
                  {user?.name?.charAt(0).toUpperCase() || 'J'}
                </AvatarFallback>
              </Avatar>
              <Button variant="outline" size="sm" onClick={onLogout} className="border-gray-300 hover:bg-gray-50">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative overflow-hidden p-4">
        {/* Background */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
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

        {/* Chat Card */}
        <Card className="max-w-4xl mx-auto h-full max-h-[calc(100vh-10rem)] overflow-y-auto flex flex-col shadow-2xl relative z-10 bg-white/95 backdrop-blur-sm border-0">
          <CardHeader className="bg-gradient-to-r from-daf-red via-red-600 to-daf-red text-white min-h-fit rounded-t-lg relative overflow-hidden sticky top-0 z-20">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>
            <div className="flex items-center relative z-10">
              <Bot className="h-6 w-6 mr-3" />
              <div>
                <h2 className="text-lg font-semibold">DAF Sales Agent</h2>
                <p className="text-sm opacity-90">Your personal assistant for DAF trucks and services</p>
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
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Welcome to DAF Sales Agent</h3>
                    <p className="text-gray-600 max-w-md mx-auto">
                      I'm here to help you with questions about DAF trucks, configurations, pricing, and services. Feel free to ask your questions.
                    </p>
                  </div>
                </div>
              )}

              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`flex items-start space-x-2 max-w-[80%] ${
                      message.role === "user" ? "flex-row-reverse space-x-reverse" : "flex-row"
                    }`}
                  >
                    <Avatar className="h-8 w-8 mt-1">
                      <AvatarFallback
                        className={message.role === "user" ? "bg-daf-blue text-white" : "bg-daf-red text-white"}
                      >
                        {message.role === "user" ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
                      </AvatarFallback>
                    </Avatar>

                    <div
                      className={`rounded-lg px-4 py-2 ${
                        message.role === "user"
                          ? "bg-daf-blue text-white"
                          : "bg-white border border-gray-200 shadow-sm"
                      }`}
                    >
                      {message.isMarkdown ? (
                        <div className="text-sm prose prose-sm max-w-none dark:prose-invert prose-p:leading-relaxed prose-pre:p-0">
                          <ReactMarkdown>
                            {cleanContent(message.content)}
                          </ReactMarkdown>
                          {message.citations && message.citations.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-gray-200">
                              <p className="text-xs font-medium text-gray-500 mb-1">Sources:</p>
                              <ul className="space-y-1">
                                {deduplicateCitations(message.citations).map((citation, index) => (
                                  <li key={index} className="flex items-start space-x-1 text-xs text-gray-500">
                                    <LinkIcon className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                    <span>
                                      {cleanContent(citation.content)}
                                      {citation.fileName && (
                                        <span className="ml-1 text-daf-blue">
                                          (Source: {citation.fileName})
                                        </span>
                                      )}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-daf-red text-white">
                        <Bot className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-white rounded-lg px-4 py-2 border border-gray-200 shadow-sm">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-daf-red rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-daf-red rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                        <div className="w-2 h-2 bg-daf-red rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area - Now sticky */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 z-10">
              <form onSubmit={handleSubmit} className="flex space-x-2">
                <Input
                  type="text"
                  placeholder="Ask your question about DAF trucks..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="flex-1 focus-visible:ring-daf-blue focus-visible:ring-2 focus-visible:ring-offset-0 border-gray-200"
                  disabled={isLoading}
                />
                <Button type="submit" disabled={isLoading} className="bg-daf-blue hover:bg-daf-blue/90 text-white">
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
