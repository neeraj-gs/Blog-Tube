import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

interface BlogGenerationParams {
  type: 'youtube' | 'text';
  prompt: string;
  transcript?: string;
  metadata?: any;
}

interface BlogData {
  title: string;
  content: string;
  summary: string;
  tags: string[];
  seoMeta: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
  };
}

export async function generateBlog(params: BlogGenerationParams): Promise<BlogData> {
  const { type, prompt, transcript, metadata } = params;

  let systemPrompt = `You are BlogTube AI, an expert blog writer that creates engaging, SEO-optimized blog posts. 
  You follow best practices for web content:
  - Use clear, concise language
  - Include relevant headings (H2, H3) for structure
  - Add engaging introduction and conclusion
  - Optimize for SEO with relevant keywords
  - Format content in Markdown
  - Include actionable insights and value for readers`;

  let userPrompt = '';

  if (type === 'youtube' && transcript) {
    userPrompt = `
    Create a comprehensive blog post based on this YouTube video transcript.
    
    Video Title: ${metadata?.videoTitle || 'Video'}
    Video Author: ${metadata?.videoAuthor || 'Creator'}
    
    User Instructions: ${prompt}
    
    Transcript:
    ${transcript}
    
    Please create:
    1. An engaging blog title
    2. A well-structured blog post (1500-2500 words) with proper headings
    3. A brief summary (100-150 words)
    4. 5-7 relevant tags
    5. SEO metadata (title, description, keywords)
    
    Format the blog content in Markdown with proper headings, paragraphs, and emphasis where needed.
    Transform the transcript into a coherent, engaging blog post that provides value beyond just transcription.
    `;
  } else {
    userPrompt = `
    Create a comprehensive blog post based on this prompt:
    
    ${prompt}
    
    Please create:
    1. An engaging blog title
    2. A well-structured blog post (1500-2500 words) with proper headings
    3. A brief summary (100-150 words)
    4. 5-7 relevant tags
    5. SEO metadata (title, description, keywords)
    
    Format the blog content in Markdown with proper headings, paragraphs, and emphasis where needed.
    Ensure the content is informative, engaging, and provides real value to readers.
    `;
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 4000,
      response_format: { type: "json_object" },
    });

    const response = completion.choices[0].message.content;
    
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    // Parse the JSON response
    const blogData = JSON.parse(response);

    // Ensure all required fields are present
    return {
      title: blogData.title || 'Untitled Blog Post',
      content: blogData.content || '',
      summary: blogData.summary || '',
      tags: blogData.tags || [],
      seoMeta: {
        metaTitle: blogData.seoMeta?.metaTitle || blogData.title || 'Untitled',
        metaDescription: blogData.seoMeta?.metaDescription || blogData.summary || '',
        keywords: blogData.seoMeta?.keywords || blogData.tags || []
      }
    };
  } catch (error: any) {
    console.error('OpenAI API error:', error);
    
    // Fallback response for development/testing
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key') {
      return {
        title: "Sample Blog Post: " + prompt.substring(0, 50),
        content: `# Introduction\n\nThis is a sample blog post generated for: ${prompt}\n\n## Main Content\n\n${transcript ? `Based on the provided transcript:\n\n${transcript.substring(0, 500)}...\n\n` : ''}Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.\n\n## Key Points\n\n- Point 1: Important insight\n- Point 2: Another key takeaway\n- Point 3: Final consideration\n\n## Conclusion\n\nIn conclusion, this topic provides valuable insights for readers interested in this subject matter.\n\n---\n\n*Note: This is a sample blog post. Please configure your OpenAI API key to generate real content.*`,
        summary: "This is a sample blog post summary. Configure your OpenAI API key for actual AI-generated content.",
        tags: ["sample", "blog", "ai-generated", "blogtube"],
        seoMeta: {
          metaTitle: "Sample Blog Post",
          metaDescription: "Sample blog post description",
          keywords: ["sample", "blog", "content"]
        }
      };
    }
    
    throw error;
  }
}

// Generate blog title suggestions
export async function generateTitleSuggestions(content: string): Promise<string[]> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Generate 5 engaging, SEO-friendly blog title suggestions based on the provided content."
        },
        {
          role: "user",
          content: `Generate 5 title suggestions for this blog content:\n\n${content.substring(0, 1000)}`
        }
      ],
      temperature: 0.8,
      max_tokens: 200
    });

    const response = completion.choices[0].message.content;
    if (!response) return [];

    // Parse the response and extract titles
    const titles = response.split('\n')
      .filter(line => line.trim())
      .map(line => line.replace(/^\d+\.\s*/, '').replace(/^[-*]\s*/, '').trim())
      .filter(title => title.length > 0)
      .slice(0, 5);

    return titles;
  } catch (error) {
    console.error('Error generating title suggestions:', error);
    return [];
  }
}

// Improve/enhance existing blog content
export async function enhanceBlogContent(content: string, instructions: string): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert blog editor. Enhance and improve the provided blog content based on the user's instructions while maintaining the original message and structure."
        },
        {
          role: "user",
          content: `Enhance this blog content based on these instructions: ${instructions}\n\nOriginal content:\n${content}`
        }
      ],
      temperature: 0.7,
      max_tokens: 4000
    });

    return completion.choices[0].message.content || content;
  } catch (error) {
    console.error('Error enhancing blog content:', error);
    return content;
  }
}