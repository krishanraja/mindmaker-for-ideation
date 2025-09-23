import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WebsiteAnalysis {
  colors: string[];
  fonts: string[];
  brandingElements: string[];
  designStyle: string;
  content: string;
  imageUrls: string[];
  success: boolean;
  error?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    
    if (!url) {
      throw new Error('Website URL is required');
    }

    console.log('Analyzing website:', url);

    // Fetch the website content
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; WebsiteAnalyzer/1.0)'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch website: ${response.status}`);
    }

    const html = await response.text();
    
    // Extract basic information from HTML
    const analysis: WebsiteAnalysis = {
      colors: extractColors(html),
      fonts: extractFonts(html),
      brandingElements: extractBrandingElements(html),
      designStyle: analyzeDesignStyle(html),
      content: extractTextContent(html),
      imageUrls: extractImages(html, url),
      success: true
    };

    console.log('Website analysis completed:', analysis);

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error analyzing website:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message,
      colors: [],
      fonts: [],
      brandingElements: [],
      designStyle: '',
      content: '',
      imageUrls: []
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function extractColors(html: string): string[] {
  const colors = new Set<string>();
  
  // Extract CSS color values
  const cssColorRegex = /#([0-9A-Fa-f]{3}){1,2}|rgb\([^)]+\)|rgba\([^)]+\)|hsl\([^)]+\)|hsla\([^)]+\)/g;
  const matches = html.match(cssColorRegex);
  
  if (matches) {
    matches.forEach(color => colors.add(color.toLowerCase()));
  }
  
  return Array.from(colors).slice(0, 10);
}

function extractFonts(html: string): string[] {
  const fonts = new Set<string>();
  
  // Extract font-family declarations
  const fontRegex = /font-family\s*:\s*([^;}]+)/gi;
  let match;
  
  while ((match = fontRegex.exec(html)) !== null) {
    const fontFamily = match[1].replace(/["']/g, '').trim();
    if (fontFamily) {
      fonts.add(fontFamily);
    }
  }
  
  return Array.from(fonts).slice(0, 5);
}

function extractBrandingElements(html: string): string[] {
  const elements = [];
  
  // Extract title
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (titleMatch) {
    elements.push(`Title: ${titleMatch[1].trim()}`);
  }
  
  // Extract meta description
  const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["'][^>]*>/i);
  if (descMatch) {
    elements.push(`Description: ${descMatch[1].trim()}`);
  }
  
  // Extract logo alt text
  const logoRegex = /<img[^>]*alt=["']([^"']*logo[^"']*)["'][^>]*>/gi;
  let logoMatch;
  while ((logoMatch = logoRegex.exec(html)) !== null) {
    elements.push(`Logo: ${logoMatch[1].trim()}`);
  }
  
  return elements;
}

function analyzeDesignStyle(html: string): string {
  const indicators = {
    modern: ['gradient', 'shadow', 'rounded', 'flex', 'grid'],
    minimalist: ['clean', 'simple', 'minimal', 'white', 'space'],
    corporate: ['professional', 'business', 'formal', 'blue', 'navy'],
    creative: ['colorful', 'artistic', 'creative', 'bright', 'vibrant']
  };
  
  const htmlLower = html.toLowerCase();
  const scores = Object.keys(indicators).map(style => ({
    style,
    score: indicators[style].reduce((acc, keyword) => 
      acc + (htmlLower.includes(keyword) ? 1 : 0), 0)
  }));
  
  const topStyle = scores.sort((a, b) => b.score - a.score)[0];
  return topStyle.score > 0 ? topStyle.style : 'standard';
}

function extractTextContent(html: string): string {
  // Remove scripts and styles
  let content = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  content = content.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  
  // Extract text from common content elements
  const textElements = content.match(/<(h[1-6]|p|div|span|a)[^>]*>([^<]+)</gi);
  
  if (textElements) {
    return textElements
      .map(element => element.replace(/<[^>]*>/g, '').trim())
      .filter(text => text.length > 10)
      .slice(0, 10)
      .join(' ')
      .substring(0, 500);
  }
  
  return '';
}

function extractImages(html: string, baseUrl: string): string[] {
  const images = new Set<string>();
  const imgRegex = /<img[^>]*src=["']([^"']+)["'][^>]*>/gi;
  let match;
  
  while ((match = imgRegex.exec(html)) !== null) {
    let src = match[1];
    
    // Convert relative URLs to absolute
    if (src.startsWith('/')) {
      const url = new URL(baseUrl);
      src = `${url.protocol}//${url.host}${src}`;
    } else if (!src.startsWith('http')) {
      src = new URL(src, baseUrl).href;
    }
    
    images.add(src);
  }
  
  return Array.from(images).slice(0, 5);
}