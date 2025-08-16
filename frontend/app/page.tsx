"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  PlayCircle,
  FileText,
  Sparkles,
  ArrowRight,
  Check,
  Zap,
  Globe,
  BookOpen,
  TrendingUp,
} from "lucide-react";

export default function Home() {
  const { isSignedIn } = useAuth();
  const router = useRouter();

  const features = [
    {
      icon: PlayCircle,
      title: "YouTube to Blog",
      description: "Transform any YouTube video into a well-structured blog post with AI",
    },
    {
      icon: FileText,
      title: "AI Content Generation",
      description: "Generate high-quality blog posts from simple prompts",
    },
    {
      icon: Sparkles,
      title: "SEO Optimized",
      description: "Automatically optimized for search engines with meta tags and keywords",
    },
    {
      icon: BookOpen,
      title: "Smart Editor",
      description: "Edit and refine your blogs with our powerful markdown editor",
    },
    {
      icon: Globe,
      title: "Publish Anywhere",
      description: "Export your blogs in multiple formats for any platform",
    },
    {
      icon: TrendingUp,
      title: "Analytics Ready",
      description: "Track performance with built-in stats and reading time",
    },
  ];

  const pricingPlans = [
    {
      name: "Free",
      price: "$0",
      credits: "10 blogs/month",
      features: ["Basic AI generation", "YouTube transcripts", "Markdown export"],
    },
    {
      name: "Pro",
      price: "$19",
      credits: "100 blogs/month",
      popular: true,
      features: [
        "Advanced AI models",
        "Priority processing",
        "Custom templates",
        "API access",
      ],
    },
    {
      name: "Enterprise",
      price: "Custom",
      credits: "Unlimited",
      features: [
        "Unlimited generation",
        "Custom AI training",
        "Dedicated support",
        "White-label options",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20 text-center">
        <Badge className="mb-4" variant="secondary">
          <Zap className="w-3 h-3 mr-1" />
          Powered by Advanced AI
        </Badge>
        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Transform Content Into
          <br />
          Engaging Blog Posts
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          BlogTube uses cutting-edge AI to convert YouTube videos and prompts into
          SEO-optimized, professionally written blog posts in seconds.
        </p>
        <div className="flex gap-4 justify-center">
          <Button
            size="lg"
            onClick={() => router.push(isSignedIn ? "/dashboard" : "/sign-up")}
            className="gap-2"
          >
            {isSignedIn ? "Go to Dashboard" : "Get Started Free"}
            <ArrowRight className="w-4 h-4" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => router.push("/sign-in")}
          >
            Sign In
          </Button>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">
          Everything You Need to Create Amazing Content
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
              <feature.icon className="w-10 h-10 mb-4 text-primary" />
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <div className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">
          How It Works
        </h2>
        <div className="max-w-4xl mx-auto">
          <div className="space-y-8">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Input Your Source</h3>
                <p className="text-muted-foreground">
                  Paste a YouTube URL or write a prompt describing your blog topic
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">AI Generation</h3>
                <p className="text-muted-foreground">
                  Our AI analyzes the content and generates a comprehensive blog post
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Edit & Publish</h3>
                <p className="text-muted-foreground">
                  Refine your blog with our editor and publish or export anywhere
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">
          Simple, Transparent Pricing
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {pricingPlans.map((plan, index) => (
            <Card
              key={index}
              className={`p-6 ${plan.popular ? "border-primary shadow-lg" : ""}`}
            >
              {plan.popular && (
                <Badge className="mb-4" variant="default">
                  Most Popular
                </Badge>
              )}
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <p className="text-3xl font-bold mb-4">
                {plan.price}
                {plan.price !== "Custom" && <span className="text-base font-normal">/mo</span>}
              </p>
              <p className="text-muted-foreground mb-6">{plan.credits}</p>
              <ul className="space-y-2 mb-6">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                className="w-full"
                variant={plan.popular ? "default" : "outline"}
                onClick={() => router.push("/sign-up")}
              >
                Get Started
              </Button>
            </Card>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-20">
        <Card className="p-12 text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Transform Your Content?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of content creators using BlogTube AI
          </p>
          <Button
            size="lg"
            variant="secondary"
            onClick={() => router.push(isSignedIn ? "/dashboard" : "/sign-up")}
            className="gap-2"
          >
            Start Creating Now
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Card>
      </div>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2024 BlogTube. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
