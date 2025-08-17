"use client";

import { useState, useEffect, useRef } from "react";
import { useUser, useAuth } from "@clerk/nextjs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Send, PlayCircle, FileText, Sparkles, Copy, Download, Edit } from "lucide-react";
import { useRouter } from "next/navigation";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  blogData?: any;
}

export default function DashboardPage() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMode, setInputMode] = useState<"text" | "youtube">("text");
  const [textPrompt, setTextPrompt] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [youtubeInstructions, setYoutubeInstructions] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [credits, setCredits] = useState({ used: 0, limit: 10 });
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Sync user with backend on mount
    if (user) {
      syncUser();
      fetchUserCredits();
    }
  }, [user]);

  useEffect(() => {
    // Auto-scroll to bottom when new messages are added
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const syncUser = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/sync`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: user?.id }),
      });
    } catch (error) {
      console.error("Error syncing user:", error);
    }
  };

  const fetchUserCredits = async () => {
    // This would fetch from your API
    // For now, using mock data
    setCredits({ used: 3, limit: 10 });
  };

  const handleSubmit = async () => {
    console.log("Starting blog generation...");
    console.log("API URL:", process.env.NEXT_PUBLIC_API_URL);
    console.log("User:", user?.id);
    
    if (inputMode === "text" && !textPrompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter a prompt",
        variant: "destructive",
      });
      return;
    }

    if (inputMode === "youtube" && !youtubeUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter a YouTube URL",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputMode === "text" ? textPrompt : `Generate blog from: ${youtubeUrl}\n${youtubeInstructions ? `Instructions: ${youtubeInstructions}` : ""}`,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    try {
      let response;
      const token = await getToken();
      console.log("Auth token:", token ? "Present" : "Missing");
      
      if (inputMode === "youtube") {
        // First, fetch transcript
        console.log("Fetching YouTube transcript...");
        const transcriptRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/youtube/transcript`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ url: youtubeUrl }),
        });

        if (!transcriptRes.ok) {
          throw new Error("Failed to fetch transcript");
        }

        const transcriptData = await transcriptRes.json();

        // Generate blog
        response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/prompts`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${await user?.getToken()}`,
          },
          body: JSON.stringify({
            type: "youtube",
            prompt: youtubeInstructions || "Create a comprehensive blog post from this video",
            youtubeUrl,
            transcript: transcriptData.transcript,
            metadata: transcriptData.metadata,
          }),
        });
      } else {
        // Generate blog from text prompt
        console.log("Generating blog from text prompt...");
        response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/prompts`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            type: "text",
            prompt: textPrompt,
          }),
        });
      }
      
      console.log("Response status:", response.status);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate blog");
      }

      const data = await response.json();

      // Add assistant message with blog data
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I've generated a blog post for you. You can view, edit, or download it below.",
        timestamp: new Date(),
        blogData: data.blog,
      };
      setMessages((prev) => [...prev, assistantMessage]);

      // Update credits
      setCredits((prev) => ({ ...prev, used: prev.used + 1 }));

      // Clear inputs
      setTextPrompt("");
      setYoutubeUrl("");
      setYoutubeInstructions("");

      toast({
        title: "Success",
        description: "Blog generated successfully!",
      });
    } catch (error: any) {
      console.error("Error generating blog:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate blog",
        variant: "destructive",
      });

      // Remove user message if generation failed
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (blogId: string) => {
    router.push(`/editor/${blogId}`);
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied",
      description: "Blog content copied to clipboard",
    });
  };

  const handleDownload = (blog: any) => {
    const element = document.createElement("a");
    const file = new Blob([blog.content], { type: "text/markdown" });
    element.href = URL.createObjectURL(file);
    element.download = `${blog.title.replace(/\s+/g, "-").toLowerCase()}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto p-4 max-w-6xl">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              BlogTube AI
            </h1>
            <p className="text-muted-foreground">Transform content into engaging blogs</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="px-3 py-1">
              <Sparkles className="w-3 h-3 mr-1" />
              {credits.limit - credits.used} credits remaining
            </Badge>
            <Avatar>
              <AvatarImage src={user?.imageUrl} />
              <AvatarFallback>{user?.firstName?.[0]}</AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* Main Chat Interface */}
        <Card className="h-[calc(100vh-200px)] flex flex-col">
          {/* Messages Area */}
          <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Sparkles className="w-12 h-12 text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold mb-2">Welcome to BlogTube AI</h2>
                <p className="text-muted-foreground max-w-md">
                  Generate SEO-optimized blog posts from YouTube videos or your own prompts.
                  Start by entering a prompt or YouTube URL below.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      } rounded-lg p-4`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      {message.blogData && (
                        <Card className="mt-4 p-4">
                          <h3 className="font-semibold mb-2">{message.blogData.title}</h3>
                          <p className="text-sm text-muted-foreground mb-3">
                            {message.blogData.summary}
                          </p>
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleEdit(message.blogData._id)}>
                              <Edit className="w-3 h-3 mr-1" />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCopy(message.blogData.content)}
                            >
                              <Copy className="w-3 h-3 mr-1" />
                              Copy
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDownload(message.blogData)}
                            >
                              <Download className="w-3 h-3 mr-1" />
                              Download
                            </Button>
                          </div>
                        </Card>
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-lg p-4">
                      <Loader2 className="w-4 h-4 animate-spin" />
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          {/* Input Area */}
          <div className="border-t p-4">
            <Tabs value={inputMode} onValueChange={(v) => setInputMode(v as "text" | "youtube")}>
              <TabsList className="mb-4">
                <TabsTrigger value="text">
                  <FileText className="w-4 h-4 mr-2" />
                  Text Prompt
                </TabsTrigger>
                <TabsTrigger value="youtube">
                  <PlayCircle className="w-4 h-4 mr-2" />
                  YouTube Video
                </TabsTrigger>
              </TabsList>

              <TabsContent value="text" className="space-y-4">
                <Textarea
                  placeholder="Enter your blog topic or prompt..."
                  value={textPrompt}
                  onChange={(e) => setTextPrompt(e.target.value)}
                  className="min-h-[100px]"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && e.metaKey) {
                      handleSubmit();
                    }
                  }}
                />
              </TabsContent>

              <TabsContent value="youtube" className="space-y-4">
                <Input
                  placeholder="Enter YouTube URL..."
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                />
                <Textarea
                  placeholder="Additional instructions for the blog (optional)..."
                  value={youtubeInstructions}
                  onChange={(e) => setYoutubeInstructions(e.target.value)}
                  className="min-h-[60px]"
                />
              </TabsContent>
            </Tabs>

            <Button
              onClick={handleSubmit}
              disabled={isLoading || credits.used >= credits.limit}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Generate Blog
                </>
              )}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}