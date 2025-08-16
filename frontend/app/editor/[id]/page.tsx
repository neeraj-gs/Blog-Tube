"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import dynamic from "next/dynamic";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowLeft,
  Save,
  Download,
  Copy,
  Eye,
  Edit,
  MoreVertical,
  Loader2,
  FileText,
  Hash,
  Clock,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

interface Blog {
  _id: string;
  title: string;
  content: string;
  summary: string;
  tags: string[];
  status: "draft" | "published" | "archived";
  stats: {
    wordCount: number;
    readTime: number;
  };
  createdAt: string;
  updatedAt: string;
}

export default function EditorPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const { toast } = useToast();
  
  const [blog, setBlog] = useState<Blog | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [summary, setSummary] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("edit");
  const [showPublishDialog, setShowPublishDialog] = useState(false);

  useEffect(() => {
    if (params.id && user) {
      fetchBlog();
    }
  }, [params.id, user]);

  const fetchBlog = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/blogs/${params.id}`,
        {
          headers: {
            Authorization: `Bearer ${await user?.getToken()}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch blog");
      }

      const data = await response.json();
      setBlog(data);
      setTitle(data.title);
      setContent(data.content);
      setSummary(data.summary || "");
      setTags(data.tags || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load blog",
        variant: "destructive",
      });
      router.push("/dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/blogs/${params.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${await user?.getToken()}`,
          },
          body: JSON.stringify({
            title,
            content,
            summary,
            tags,
            status: blog?.status,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save blog");
      }

      const updatedBlog = await response.json();
      setBlog(updatedBlog);
      
      toast({
        title: "Success",
        description: "Blog saved successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save blog",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/blogs/${params.id}/publish`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${await user?.getToken()}`,
          },
          body: JSON.stringify({ publish: true }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to publish blog");
      }

      const updatedBlog = await response.json();
      setBlog(updatedBlog);
      setShowPublishDialog(false);
      
      toast({
        title: "Success",
        description: "Blog published successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to publish blog",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([content], { type: "text/markdown" });
    element.href = URL.createObjectURL(file);
    element.download = `${title.replace(/\s+/g, "-").toLowerCase()}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied",
      description: "Blog content copied to clipboard",
    });
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const calculateStats = () => {
    const words = content.split(/\s+/).filter(Boolean).length;
    const readTime = Math.ceil(words / 200);
    return { words, readTime };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const stats = calculateStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto p-4 max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard")}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Blog Editor</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={blog?.status === "published" ? "default" : "secondary"}>
                  {blog?.status}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  <Clock className="w-3 h-3 inline mr-1" />
                  {stats.readTime} min read • {stats.words} words
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save
            </Button>
            
            <Dialog open={showPublishDialog} onOpenChange={setShowPublishDialog}>
              <DialogTrigger asChild>
                <Button variant={blog?.status === "published" ? "secondary" : "default"}>
                  {blog?.status === "published" ? "Unpublish" : "Publish"}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {blog?.status === "published" ? "Unpublish Blog" : "Publish Blog"}
                  </DialogTitle>
                  <DialogDescription>
                    {blog?.status === "published"
                      ? "This will make your blog private. You can publish it again later."
                      : "This will make your blog publicly available. Make sure you've reviewed it."}
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowPublishDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handlePublish} disabled={isSaving}>
                    {isSaving ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : blog?.status === "published" ? (
                      "Unpublish"
                    ) : (
                      "Publish"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleCopy}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Content
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDownload}>
                  <Download className="w-4 h-4 mr-2" />
                  Download as Markdown
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Title Input */}
        <Card className="mb-4 p-4">
          <Input
            placeholder="Blog Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-2xl font-bold border-0 focus-visible:ring-0 p-0"
          />
        </Card>

        {/* Summary Input */}
        <Card className="mb-4 p-4">
          <textarea
            placeholder="Blog summary (optional)"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            className="w-full resize-none border-0 focus:outline-none text-muted-foreground"
            rows={2}
          />
        </Card>

        {/* Tags */}
        <Card className="mb-4 p-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Hash className="w-4 h-4 text-muted-foreground" />
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="cursor-pointer">
                {tag}
                <button
                  onClick={() => removeTag(tag)}
                  className="ml-1 hover:text-destructive"
                >
                  ×
                </button>
              </Badge>
            ))}
            <Input
              placeholder="Add tag..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addTag();
                }
              }}
              className="w-32 h-7 text-sm"
            />
          </div>
        </Card>

        {/* Editor Tabs */}
        <Card className="min-h-[600px]">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="border-b px-4">
              <TabsList className="h-12 bg-transparent">
                <TabsTrigger value="edit" className="gap-2">
                  <Edit className="w-4 h-4" />
                  Edit
                </TabsTrigger>
                <TabsTrigger value="preview" className="gap-2">
                  <Eye className="w-4 h-4" />
                  Preview
                </TabsTrigger>
                <TabsTrigger value="split" className="gap-2">
                  <FileText className="w-4 h-4" />
                  Split View
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="edit" className="p-0 mt-0">
              <MDEditor
                value={content}
                onChange={(val) => setContent(val || "")}
                height={600}
                preview="edit"
                hideToolbar={false}
              />
            </TabsContent>

            <TabsContent value="preview" className="p-6">
              <div className="prose prose-slate dark:prose-invert max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
              </div>
            </TabsContent>

            <TabsContent value="split" className="p-0 mt-0">
              <MDEditor
                value={content}
                onChange={(val) => setContent(val || "")}
                height={600}
                preview="live"
                hideToolbar={false}
              />
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}