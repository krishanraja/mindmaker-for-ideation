import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Brain, Target, Zap, Copy, Share, Download, MessageCircle, Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/use-toast';
import ProgressRing from '@/components/ProgressRing';
import NeuronLoop from '@/components/NeuronLoop';

interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  tools: string[];
  dataFlow: string;
}

interface AgentSuggestion {
  id: string;
  name: string;
  role: string;
  description: string;
  platform: string;
  deployLink?: string;
}

interface MindmakerSession {
  id: string;
  rawInput: string;
  clarifications: string[];
  finalSummary: string;
  lovablePrompt: string;
  workflows: WorkflowStep[];
  agents: AgentSuggestion[];
  currentStep: number; // 1: Input, 2: Clarify, 3: Generate
}

const Index = () => {
  const [session, setSession] = useState<MindmakerSession>({
    id: '',
    rawInput: '',
    clarifications: [],
    finalSummary: '',
    lovablePrompt: '',
    workflows: [],
    agents: [],
    currentStep: 0
  });

  const [isStarted, setIsStarted] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{role: 'user' | 'ai', content: string}>>([]);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleStart = () => {
    setIsStarted(true);
    setSession(prev => ({ 
      ...prev, 
      currentStep: 1,
      id: `session_${Date.now()}`
    }));
  };

  // Advanced semantic analysis using multiple intelligence layers
  const analyzeInput = async (input: string): Promise<{ needsClarification: boolean; questions?: string[] }> => {
    setIsGenerating(true);
    
    // Simulate intelligent processing
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    const analysis = performSemanticAnalysis(input);
    const conceptMap = buildConceptualMap(analysis);
    const questions = generateIntelligentQuestions(conceptMap, input);
    
    setIsGenerating(false);
    
    return {
      needsClarification: questions.length > 0,
      questions: questions.slice(0, 2) // Focus on 2 high-impact questions
    };
  };

  // Multi-layer semantic analysis system
  const performSemanticAnalysis = (input: string) => {
    const text = input.toLowerCase();
    const sentences = input.split(/[.!?]+/).filter(s => s.trim());
    const words = text.split(/\s+/);
    
    // Domain classification with confidence scoring
    const domains = {
      productivity: calculateDomainScore(text, ['productivity', 'efficiency', 'workflow', 'organize', 'manage', 'track', 'automate', 'streamline', 'optimize', 'save time']),
      business: calculateDomainScore(text, ['business', 'revenue', 'profit', 'sales', 'marketing', 'customer', 'client', 'lead', 'crm', 'invoice', 'payment']),
      creative: calculateDomainScore(text, ['creative', 'design', 'content', 'art', 'photo', 'video', 'music', 'writing', 'blog', 'social media']),
      education: calculateDomainScore(text, ['learn', 'teach', 'course', 'student', 'education', 'training', 'skill', 'knowledge', 'tutorial', 'lesson']),
      health: calculateDomainScore(text, ['health', 'fitness', 'wellness', 'nutrition', 'exercise', 'medical', 'mental health', 'therapy', 'habit']),
      communication: calculateDomainScore(text, ['chat', 'message', 'email', 'communication', 'social', 'community', 'team', 'collaboration', 'meeting']),
      data: calculateDomainScore(text, ['data', 'analytics', 'report', 'dashboard', 'chart', 'metric', 'analysis', 'insight', 'visualization'])
    };

    // Intent analysis with nuanced understanding
    const intents = {
      problemSolving: analyzeIntent(text, ['problem', 'issue', 'challenge', 'difficult', 'struggle', 'pain', 'frustrating', 'annoying', 'broken']),
      improvement: analyzeIntent(text, ['better', 'improve', 'enhance', 'upgrade', 'optimize', 'faster', 'easier', 'simpler', 'more efficient']),
      creation: analyzeIntent(text, ['create', 'build', 'make', 'develop', 'design', 'launch', 'start', 'new', 'from scratch']),
      automation: analyzeIntent(text, ['automate', 'automatic', 'schedule', 'trigger', 'workflow', 'process', 'batch', 'bulk']),
      organization: analyzeIntent(text, ['organize', 'sort', 'categorize', 'structure', 'manage', 'centralize', 'consolidate']),
      sharing: analyzeIntent(text, ['share', 'collaborate', 'team', 'multiple users', 'public', 'publish', 'distribute'])
    };

    // Complexity and scope analysis
    const complexity = {
      userTypes: analyzeUserComplexity(text),
      technicalDepth: analyzeTechnicalComplexity(text),
      integrationNeeds: analyzeIntegrations(text),
      scaleRequirements: analyzeScale(text)
    };

    // Context and constraints detection
    const context = {
      timeConstraints: analyzeTimeContext(text),
      budgetIndications: analyzeBudgetContext(text),
      skillLevel: analyzeSkillLevel(text),
      urgency: analyzeUrgency(text)
    };

    return { domains, intents, complexity, context, originalInput: input };
  };

  const calculateDomainScore = (text: string, keywords: string[]): number => {
    let score = 0;
    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const matches = text.match(regex);
      if (matches) score += matches.length;
    });
    return score;
  };

  const analyzeIntent = (text: string, indicators: string[]): { present: boolean; strength: number; evidence: string[] } => {
    const evidence: string[] = [];
    let strength = 0;
    
    indicators.forEach(indicator => {
      const regex = new RegExp(`\\b${indicator}\\b`, 'gi');
      if (regex.test(text)) {
        evidence.push(indicator);
        strength += 1;
      }
    });
    
    return { present: strength > 0, strength, evidence };
  };

  const analyzeUserComplexity = (text: string): string => {
    if (/\b(enterprise|corporate|organization|department|company-wide)\b/i.test(text)) return 'enterprise';
    if (/\b(team|group|multiple users|colleagues|staff)\b/i.test(text)) return 'team';
    if (/\b(personal|myself|my own|individual|solo)\b/i.test(text)) return 'personal';
    return 'unclear';
  };

  const analyzeTechnicalComplexity = (text: string): string => {
    if (/\b(api|integration|webhook|database|sql|algorithm|ml|ai)\b/i.test(text)) return 'high';
    if (/\b(automation|workflow|process|data|analytics|reports)\b/i.test(text)) return 'medium';
    return 'low';
  };

  const analyzeIntegrations = (text: string): string[] => {
    const integrations = [];
    if (/\b(google|gmail|drive|sheets|calendar)\b/i.test(text)) integrations.push('Google Workspace');
    if (/\b(slack|discord|teams|zoom)\b/i.test(text)) integrations.push('Communication Tools');
    if (/\b(salesforce|hubspot|crm)\b/i.test(text)) integrations.push('CRM');
    if (/\b(stripe|paypal|payment)\b/i.test(text)) integrations.push('Payment Processing');
    if (/\b(social|facebook|twitter|instagram|linkedin)\b/i.test(text)) integrations.push('Social Media');
    return integrations;
  };

  const analyzeScale = (text: string): string => {
    if (/\b(thousands|many users|scale|large|enterprise)\b/i.test(text)) return 'large';
    if (/\b(hundreds|medium|growing|expanding)\b/i.test(text)) return 'medium';
    return 'small';
  };

  const analyzeTimeContext = (text: string): string => {
    if (/\b(urgent|asap|quickly|soon|deadline|rush)\b/i.test(text)) return 'urgent';
    if (/\b(eventually|future|long term|when I have time)\b/i.test(text)) return 'flexible';
    return 'normal';
  };

  const analyzeBudgetContext = (text: string): string => {
    if (/\b(budget|cost|expensive|cheap|free|money|price)\b/i.test(text)) return 'cost-conscious';
    if (/\b(premium|high-end|enterprise|investment)\b/i.test(text)) return 'premium';
    return 'undefined';
  };

  const analyzeSkillLevel = (text: string): string => {
    if (/\b(technical|developer|engineer|code|programming)\b/i.test(text)) return 'technical';
    if (/\b(beginner|new|first time|simple|easy)\b/i.test(text)) return 'beginner';
    return 'intermediate';
  };

  const analyzeUrgency = (text: string): string => {
    if (/\b(urgent|critical|immediately|asap|deadline)\b/i.test(text)) return 'high';
    if (/\b(eventually|someday|future|long-term)\b/i.test(text)) return 'low';
    return 'medium';
  };

  // Build conceptual understanding map
  const buildConceptualMap = (analysis: any) => {
    const topDomain = Object.entries(analysis.domains).reduce((a, b) => a[1] > b[1] ? a : b);
    const primaryIntents = Object.entries(analysis.intents)
      .filter(([_, data]: [string, any]) => data.present)
      .sort((a: any, b: any) => b[1].strength - a[1].strength);

    return {
      primaryDomain: topDomain[0],
      domainConfidence: topDomain[1],
      mainIntents: primaryIntents.slice(0, 2).map(([intent, _]) => intent),
      userProfile: {
        type: analysis.complexity.userTypes,
        skillLevel: analysis.context.skillLevel,
        urgency: analysis.context.urgency
      },
      technicalProfile: {
        complexity: analysis.complexity.technicalDepth,
        integrations: analysis.complexity.integrationNeeds,
        scale: analysis.complexity.scaleRequirements
      },
      missingElements: identifyMissingElements(analysis)
    };
  };

  const identifyMissingElements = (analysis: any) => {
    const missing = [];
    
    // Check for missing problem definition
    if (!analysis.intents.problemSolving.present && !analysis.intents.improvement.present) {
      missing.push('problem_definition');
    }
    
    // Check for missing user definition
    if (analysis.complexity.userTypes === 'unclear') {
      missing.push('target_users');
    }
    
    // Check for missing success metrics
    if (!/(metric|measure|success|goal|objective|outcome)/i.test(analysis.originalInput)) {
      missing.push('success_metrics');
    }
    
    // Check for missing technical preferences
    if (analysis.complexity.technicalDepth === 'low' && analysis.primaryDomain !== 'simple') {
      missing.push('technical_approach');
    }

    return missing;
  };

  // Generate highly contextual questions
  const generateIntelligentQuestions = (conceptMap: any, originalInput: string): string[] => {
    const questions = [];
    const { primaryDomain, mainIntents, userProfile, technicalProfile, missingElements } = conceptMap;

    // Ultra-specific domain and intent-based questions
    if (missingElements.includes('problem_definition')) {
      if (primaryDomain === 'productivity' && userProfile.type === 'team') {
        questions.push(`I see you're thinking about team productivity. What's the specific bottleneck that's costing your team the most time each week? Is it information scattered across tools, repetitive tasks, or something else entirely?`);
      } else if (primaryDomain === 'business' && mainIntents.includes('automation')) {
        questions.push(`You mentioned business automation - what's the manual process that you find yourself (or your team) doing over and over that makes you think "there has to be a better way"?`);
      } else if (primaryDomain === 'creative') {
        questions.push(`For your creative project, what's the gap between your vision and what current tools let you achieve? What creative workflow step feels unnecessarily complicated?`);
      } else {
        questions.push(`What specific pain point or inefficiency sparked this idea? I want to understand the exact moment when you thought "I need a solution for this."`);
      }
    }

    if (missingElements.includes('target_users') && questions.length < 2) {
      if (primaryDomain === 'business') {
        questions.push(`Who would be the primary decision-maker for adopting this solution? Are you thinking individual professionals, small business owners, department heads, or enterprise buyers?`);
      } else if (technicalProfile.complexity === 'high') {
        questions.push(`This sounds technically sophisticated - are you building for developers/power users who want advanced features, or do you need to make complex functionality simple for non-technical users?`);
      } else {
        questions.push(`Picture your ideal user facing the problem you mentioned - what's their role, daily challenges, and what would make them say "finally, exactly what I needed"?`);
      }
    }

    if (missingElements.includes('success_metrics') && questions.length < 2) {
      if (userProfile.urgency === 'high') {
        questions.push(`Since this seems urgent, what's the key outcome that would make this project a success for you? Time saved, revenue gained, or something else measurable?`);
      } else if (primaryDomain === 'data') {
        questions.push(`What's the insight or metric you wish you could see in real-time that would change how you make decisions?`);
      } else {
        questions.push(`How would you know this solution is working perfectly? What would users be doing differently, or what results would you see?`);
      }
    }

    // Advanced contextual follow-ups based on sophisticated analysis
    if (questions.length === 0) {
      // Generate highly specific questions based on domain + intent combination
      if (primaryDomain === 'productivity' && mainIntents.includes('organization')) {
        questions.push(`I sense you want to organize something complex. What information or process feels chaotic right now that, if perfectly organized, would unlock significant value?`);
      } else if (primaryDomain === 'communication' && technicalProfile.integrations.length > 0) {
        questions.push(`With ${technicalProfile.integrations.join(' and ')} in the mix, what communication gap or workflow break happens at the handoff points between these tools?`);
      }
    }

    return questions;
  };

  const generateClarifyingQuestions = (responses: string[]): string[] => {
    // Advanced contextual follow-up generation using semantic analysis
    const combinedResponses = responses.join(' ');
    const responseAnalysis = performSemanticAnalysis(combinedResponses);
    const conceptMap = buildConceptualMap(responseAnalysis);
    
    return generateIntelligentFollowUps(conceptMap, responses);
  };

  const generateIntelligentFollowUps = (conceptMap: any, responses: string[]): string[] => {
    const { primaryDomain, mainIntents, userProfile, missingElements } = conceptMap;
    const responseCount = responses.length;
    const lastResponse = responses[responses.length - 1]?.toLowerCase() || '';
    
    // First follow-up: Deep dive into the specific area they mentioned
    if (responseCount === 1) {
      if (primaryDomain === 'productivity' && mainIntents.includes('automation')) {
        if (userProfile.type === 'team') {
          return ["Excellent! For team automation, what's the specific handoff or approval process that creates the biggest delays? Is it waiting for sign-offs, data entry, or something else entirely?"];
        } else {
          return ["Perfect! What's the task you find yourself doing repeatedly that makes you think 'I'm basically a human robot doing this'? That's usually where automation creates the biggest impact."];
        }
      } else if (primaryDomain === 'business' && lastResponse.includes('customer')) {
        return ["Great customer focus! What's the moment in your customer journey where you lose the most potential value? Is it during onboarding, support, sales follow-up, or somewhere else?"];
      } else if (primaryDomain === 'creative' && mainIntents.includes('organization')) {
        return ["I love the creative organization angle! What happens to your creative assets after you create them? Do they get lost, become hard to find, or fail to reach the right audiences?"];
      } else if (primaryDomain === 'data') {
        return ["Data-driven approach is smart! What decision do you currently make based on gut feeling that you wish you could make with real-time data instead?"];
      } else if (mainIntents.includes('problemSolving')) {
        return ["That problem sounds frustrating! When this issue happens, what's the ripple effect? What else breaks down or gets delayed because of this core problem?"];
      } else {
        return ["I'm seeing the vision! What would be different about your day/work/life if this solution worked perfectly? Paint me a picture of that ideal scenario."];
      }
    }
    
    // Second follow-up: Focus on the missing critical element or success metrics
    if (responseCount === 2) {
      if (missingElements.includes('success_metrics')) {
        if (primaryDomain === 'business') {
          return ["This is coming together nicely! If this solution saved you money or made you money, how would you measure that? Time saved, deals closed faster, costs reduced?"];
        } else {
          return ["Almost there! How would you know this is working amazingly well? What would you be able to do that you can't do now, or what would happen faster/better?"];
        }
      } else if (userProfile.type === 'unclear' && !missingElements.includes('target_users')) {
        return ["Got it! One key question: who else would benefit from this solution? Are you thinking just for yourself, your team, or could this help others facing the same challenge?"];
      } else if (conceptMap.technicalProfile.integrations.length === 0 && primaryDomain !== 'simple') {
        return ["Perfect! Any existing tools or platforms this would need to work with? Email, Slack, Google Workspace, specific software you use daily?"];
      } else {
        return ["Excellent insights! What's the one thing that, if this solution did it perfectly, would make you think 'this is exactly what I needed'?"];
      }
    }
    
    // Fallback for edge cases
    return ["Perfect! I have a clear picture now. Let me create your personalized blueprint."];
  };

  const generateBlueprint = (input: string, clarifications: string[]) => {
    const combinedContext = `${input} ${clarifications.join(' ')}`;
    
    // Perform advanced semantic analysis on combined context
    const analysis = performSemanticAnalysis(combinedContext);
    const conceptMap = buildConceptualMap(analysis);
    
    // Generate truly personalized blueprint based on deep understanding
    const lovablePrompt = generatePersonalizedPrompt(conceptMap, combinedContext);
    const workflows = generateIntelligentWorkflows(conceptMap, combinedContext);
    const agents = generateContextualAgents(conceptMap, combinedContext);

    return { lovablePrompt, workflows, agents };
  };

  const generatePersonalizedPrompt = (conceptMap: any, context: string): string => {
    const { primaryDomain, userProfile, technicalProfile } = conceptMap;
    
    // Generate domain-specific title and description
    const title = generateIntelligentTitle(conceptMap, context);
    const coreFeatures = generatePersonalizedFeatures(conceptMap, context);
    const uxDescription = generatePersonalizedUX(conceptMap, context);
    const technicalSpecs = generateTechnicalSpecs(conceptMap);
    
    return `Create a "${title}" web application.

**Project Overview:**
${generateProjectOverview(conceptMap, context)}

**Core Features:**
${coreFeatures}

**User Experience Design:**
${uxDescription}

**Technical Requirements:**
${technicalSpecs}

**Design System:**
${generateDesignSystem(conceptMap)}

**Success Metrics & Analytics:**
${generateSuccessMetrics(conceptMap)}`;
  };

  const generateProjectOverview = (conceptMap: any, context: string): string => {
    const { primaryDomain, mainIntents, userProfile } = conceptMap;
    
    if (primaryDomain === 'productivity' && mainIntents.includes('automation')) {
      return `A powerful productivity automation platform that eliminates repetitive workflows and saves users significant time. Designed for ${userProfile.type === 'team' ? 'team collaboration' : 'individual efficiency'} with focus on seamless integration and intelligent automation.`;
    } else if (primaryDomain === 'business' && userProfile.type === 'enterprise') {
      return `An enterprise-grade business solution that scales with organizational needs. Built to handle complex workflows, multiple user roles, and integration with existing business systems while maintaining security and compliance standards.`;
    } else if (primaryDomain === 'creative') {
      return `A creative workflow enhancement tool that bridges the gap between creative vision and technical execution. Streamlines creative processes while maintaining artistic integrity and collaborative capabilities.`;
    } else if (primaryDomain === 'data') {
      return `An intelligent data platform that transforms raw information into actionable insights. Features real-time analytics, customizable dashboards, and automated reporting to drive data-driven decision making.`;
    }
    
    return `A specialized solution that addresses specific user needs through intelligent automation and seamless user experience. Built with scalability and user-centric design principles.`;
  };

  const generateIntelligentTitle = (conceptMap: any, context: string): string => {
    const { primaryDomain, mainIntents, technicalProfile } = conceptMap;
    
    // Generate sophisticated titles based on semantic understanding
    if (primaryDomain === 'productivity' && mainIntents.includes('automation')) {
      return technicalProfile.complexity === 'high' ? 'AI-Powered Workflow Orchestrator' : 'Smart Task Automation Hub';
    } else if (primaryDomain === 'business' && mainIntents.includes('organization')) {
      return 'Intelligent Business Operations Platform';
    } else if (primaryDomain === 'creative' && mainIntents.includes('creation')) {
      return 'Creative Workflow Studio';
    } else if (primaryDomain === 'data') {
      return 'Real-Time Analytics Intelligence Platform';
    } else if (primaryDomain === 'communication') {
      return 'Unified Communication & Collaboration Hub';
    } else if (primaryDomain === 'education') {
      return 'Adaptive Learning Management System';
    }
    
    // Fallback with intent-based naming
    if (mainIntents.includes('problemSolving')) return 'Solution Discovery Platform';
    if (mainIntents.includes('automation')) return 'Intelligent Automation Suite';
    if (mainIntents.includes('organization')) return 'Smart Organization System';
    
    return 'AI-Enhanced Solution Platform';
  };

  const generatePersonalizedFeatures = (conceptMap: any, context: string): string => {
    const { primaryDomain, mainIntents, userProfile, technicalProfile } = conceptMap;
    const baseFeatures = [];
    
    // Core features based on domain
    if (primaryDomain === 'productivity') {
      baseFeatures.push('- Intelligent task prioritization with AI-powered suggestions');
      baseFeatures.push('- Automated workflow triggers based on user behavior patterns');
      baseFeatures.push('- Real-time collaboration tools with conflict resolution');
      baseFeatures.push('- Advanced search and filtering with natural language queries');
    } else if (primaryDomain === 'business') {
      baseFeatures.push('- Comprehensive CRM with intelligent lead scoring');
      baseFeatures.push('- Automated invoice generation and payment tracking');
      baseFeatures.push('- Advanced analytics dashboard with predictive insights');
      baseFeatures.push('- Multi-role access control with audit trails');
    } else if (primaryDomain === 'creative') {
      baseFeatures.push('- Intelligent asset organization with auto-tagging');
      baseFeatures.push('- Collaborative review system with version control');
      baseFeatures.push('- AI-powered creative suggestions and templates');
      baseFeatures.push('- Seamless export to multiple formats and platforms');
    } else if (primaryDomain === 'data') {
      baseFeatures.push('- Real-time data ingestion from multiple sources');
      baseFeatures.push('- Interactive dashboard builder with drag-and-drop interface');
      baseFeatures.push('- Automated anomaly detection and alerting');
      baseFeatures.push('- Advanced data visualization with custom chart types');
    }
    
    // Add features based on intents
    if (mainIntents.includes('automation')) {
      baseFeatures.push('- No-code automation builder with conditional logic');
      baseFeatures.push('- Integration hub with 100+ popular tools and services');
    }
    
    if (mainIntents.includes('sharing')) {
      baseFeatures.push('- Advanced sharing controls with permission management');
      baseFeatures.push('- Public gallery and community features');
    }
    
    if (userProfile.type === 'team' || userProfile.type === 'enterprise') {
      baseFeatures.push('- Team management with role-based permissions');
      baseFeatures.push('- Advanced reporting and usage analytics');
    }
    
    if (technicalProfile.complexity === 'high') {
      baseFeatures.push('- RESTful API with comprehensive documentation');
      baseFeatures.push('- Webhook system for real-time integrations');
      baseFeatures.push('- Advanced customization with plugin architecture');
    }
    
    return baseFeatures.slice(0, 8).join('\n'); // Limit to 8 most relevant features
  };

  const generatePersonalizedUX = (conceptMap: any, context: string): string => {
    const { primaryDomain, userProfile, technicalProfile } = conceptMap;
    
    if (primaryDomain === 'productivity' && userProfile.type === 'team') {
      return `Collaborative interface that reduces cognitive load and enables teams to work in parallel without conflicts. Features progressive disclosure of complexity, with simple actions upfront and power features accessible when needed. Includes real-time activity feeds and smart notifications that respect focus time.`;
    } else if (primaryDomain === 'business' && technicalProfile.complexity === 'high') {
      return `Enterprise-grade interface with customizable dashboards, role-based workflows, and extensive reporting capabilities. Supports complex data entry with intelligent auto-completion, bulk operations, and audit trails. Mobile-responsive for executives who need access on-the-go.`;
    } else if (primaryDomain === 'creative') {
      return `Visual-first interface that prioritizes creative flow over feature complexity. Drag-and-drop interactions, visual feedback, and seamless asset management. Minimalist design that gets out of the way when users are in creative mode, with collaboration tools that don't interrupt the creative process.`;
    } else if (userProfile.skillLevel === 'beginner') {
      return `Guided experience with onboarding flows, contextual help, and progressive feature introduction. Clear visual hierarchy with obvious next steps and helpful explanations. Error prevention over error correction, with smart defaults and confirmation dialogs for irreversible actions.`;
    } else if (technicalProfile.complexity === 'high') {
      return `Power-user interface with keyboard shortcuts, bulk operations, and advanced filtering. Customizable workspace with saved views and personal preferences. API access and automation tools for users who want to extend functionality.`;
    }
    
    return `Clean, intuitive interface that guides users through their goals efficiently. Smart defaults reduce decision fatigue while providing clear pathways to advanced features when needed. Responsive design ensures consistent experience across all devices.`;
  };

  const generateTechnicalSpecs = (conceptMap: any): string => {
    const { technicalProfile, userProfile } = conceptMap;
    const specs = [
      '- Built with React 18+ and TypeScript for type safety',
      '- Tailwind CSS for consistent, maintainable styling',
      '- Responsive design with mobile-first approach',
      '- Progressive Web App (PWA) capabilities',
      '- Optimized performance with code splitting and lazy loading'
    ];

    if (technicalProfile.complexity === 'high') {
      specs.push('- RESTful API with OpenAPI documentation');
      specs.push('- Real-time updates using WebSockets or Server-Sent Events');
      specs.push('- Advanced caching strategy with service workers');
      specs.push('- Database integration with proper ORM and migrations');
    }

    if (userProfile.type === 'enterprise') {
      specs.push('- SSO integration with SAML/OAuth providers');
      specs.push('- Comprehensive audit logging and compliance features');
      specs.push('- Advanced security with RBAC and data encryption');
      specs.push('- Scalable architecture supporting thousands of users');
    }

    if (technicalProfile.integrations.length > 0) {
      specs.push(`- Native integrations with ${technicalProfile.integrations.slice(0, 3).join(', ')}`);
      specs.push('- Webhook system for third-party service notifications');
    }

    return specs.join('\n');
  };

  const generateDesignSystem = (conceptMap: any): string => {
    const { primaryDomain, userProfile } = conceptMap;
    
    if (primaryDomain === 'creative') {
      return `- Color palette inspired by creative tools (deep grays, accent purples, creative highlights)
- Typography: Clean sans-serif with artistic flair for headings
- Spacing: Generous whitespace to let creative work breathe
- Components: Card-based layouts with subtle shadows and rounded corners
- Animations: Smooth, purposeful transitions that enhance creative flow`;
    } else if (primaryDomain === 'business' && userProfile.type === 'enterprise') {
      return `- Professional color scheme with strong brand colors and neutral grays
- Typography: Corporate-friendly fonts with excellent readability
- Layout: Dense information display with clear hierarchy
- Components: Data tables, charts, and forms optimized for business workflows
- Accessibility: WCAG 2.1 AA compliance with high contrast options`;
    } else if (primaryDomain === 'productivity') {
      return `- Clean, distraction-free color palette focusing on usability
- Typography: Highly readable fonts optimized for extended use
- Layout: Efficient use of space with collapsible sections
- Components: Task-oriented interface elements with clear status indicators
- Dark mode: Optimized for late-night productivity sessions`;
    }
    
    return `- Modern, accessible design system with consistent color tokens
- Typography scale that works across all screen sizes
- Component library with consistent interaction patterns
- Responsive grid system with mobile-first approach
- Light and dark themes with smooth transitions`;
  };

  const generateSuccessMetrics = (conceptMap: any): string => {
    const { primaryDomain, mainIntents, userProfile } = conceptMap;
    const metrics = [];

    if (primaryDomain === 'productivity') {
      metrics.push('- Time saved per user per week (target: 5+ hours)');
      metrics.push('- Task completion rate improvement (target: 30% increase)');
      metrics.push('- User engagement: Daily active users > 70%');
    } else if (primaryDomain === 'business') {
      metrics.push('- Revenue impact: Track deals influenced by the platform');
      metrics.push('- Process efficiency: Measure workflow completion time reduction');
      metrics.push('- User adoption: Team rollout success rate > 80%');
    } else if (primaryDomain === 'creative') {
      metrics.push('- Creative output: Track projects completed vs. started');
      metrics.push('- Collaboration efficiency: Reduce review cycles by 50%');
      metrics.push('- User satisfaction: Net Promoter Score > 70');
    }

    if (mainIntents.includes('automation')) {
      metrics.push('- Automation success rate > 95%');
      metrics.push('- Manual intervention reduction by 80%');
    }

    if (userProfile.type === 'team' || userProfile.type === 'enterprise') {
      metrics.push('- Team collaboration: Measure cross-functional project velocity');
      metrics.push('- Knowledge sharing: Track documentation creation and usage');
    }

    // Add analytics tracking
    metrics.push('- Real-time analytics dashboard for all key metrics');
    metrics.push('- A/B testing framework for continuous optimization');
    metrics.push('- User feedback collection and analysis system');

    return metrics.join('\n');
  };

  const generateIntelligentWorkflows = (conceptMap: any, context: string): WorkflowStep[] => {
    const { primaryDomain, mainIntents, technicalProfile } = conceptMap;
    const workflows: WorkflowStep[] = [];

    if (primaryDomain === 'productivity' && mainIntents.includes('automation')) {
      workflows.push({
        id: 'workflow_1',
        title: 'Smart Task Automation Pipeline',
        description: 'Intelligently identifies repetitive tasks and creates automated workflows',
        tools: ['Zapier', 'Make.com', 'AI Task Detection'],
        dataFlow: 'Task Pattern Recognition → Automation Suggestion → User Approval → Workflow Deployment → Performance Monitoring'
      });
    } else if (primaryDomain === 'business') {
      workflows.push({
        id: 'workflow_1',
        title: 'Lead Intelligence & Nurturing System',
        description: 'Automatically qualifies leads and triggers personalized nurturing sequences',
        tools: ['CRM Integration', 'Email Automation', 'Lead Scoring AI'],
        dataFlow: 'Lead Capture → AI Qualification → Score Assignment → Nurturing Sequence → Sales Handoff'
      });
    } else if (primaryDomain === 'creative') {
      workflows.push({
        id: 'workflow_1',
        title: 'Creative Asset Management Flow',
        description: 'Organizes, tags, and distributes creative assets across platforms',
        tools: ['AI Tagging', 'Cloud Storage', 'Distribution APIs'],
        dataFlow: 'Asset Upload → AI Analysis & Tagging → Quality Check → Format Optimization → Multi-platform Distribution'
      });
    }

    // Add data processing workflow if high technical complexity
    if (technicalProfile.complexity === 'high') {
      workflows.push({
        id: 'workflow_2',
        title: 'Advanced Data Processing Pipeline',
        description: 'Real-time data ingestion, processing, and insight generation',
        tools: ['Data Pipelines', 'ML Models', 'Real-time Analytics'],
        dataFlow: 'Data Ingestion → Validation & Cleaning → AI Processing → Insight Generation → Alert System'
      });
    }

    // Add integration workflow if integrations are needed
    if (technicalProfile.integrations.length > 0) {
      workflows.push({
        id: 'workflow_3',
        title: 'Multi-Platform Integration Hub',
        description: `Seamlessly connects with ${technicalProfile.integrations.join(', ')} and other tools`,
        tools: ['API Gateway', 'Webhook Manager', 'Data Sync Engine'],
        dataFlow: 'Platform Event → Integration Router → Data Transformation → Target Platform Update → Sync Confirmation'
      });
    }

    return workflows.slice(0, 3); // Limit to 3 most relevant workflows
  };

  const generateContextualAgents = (conceptMap: any, context: string): AgentSuggestion[] => {
    const { primaryDomain, mainIntents, technicalProfile, userProfile } = conceptMap;
    const agents: AgentSuggestion[] = [];

    if (primaryDomain === 'productivity') {
      agents.push({
        id: 'agent_1',
        name: 'Productivity Intelligence Assistant',
        role: 'Workflow Optimization',
        description: 'Analyzes user behavior patterns and suggests productivity improvements and automation opportunities',
        platform: 'Custom GPT',
        deployLink: 'https://chat.openai.com/gpts'
      });
    } else if (primaryDomain === 'business') {
      agents.push({
        id: 'agent_1',
        name: 'Business Intelligence Advisor',
        role: 'Strategic Analysis',
        description: 'Provides data-driven insights for business decisions and identifies growth opportunities',
        platform: 'Claude Pro',
        deployLink: 'https://claude.ai'
      });
    } else if (primaryDomain === 'creative') {
      agents.push({
        id: 'agent_1',
        name: 'Creative Workflow Optimizer',
        role: 'Creative Process Enhancement',
        description: 'Understands creative workflows and suggests optimizations while preserving artistic integrity',
        platform: 'Custom GPT',
        deployLink: 'https://chat.openai.com/gpts'
      });
    }

    if (mainIntents.includes('automation')) {
      agents.push({
        id: 'agent_2',
        name: 'Automation Architect',
        role: 'Process Automation',
        description: 'Designs and implements complex automation workflows across multiple platforms and tools',
        platform: 'N8N with AI',
        deployLink: 'https://n8n.io'
      });
    }

    if (technicalProfile.complexity === 'high') {
      agents.push({
        id: 'agent_3',
        name: 'Technical Implementation Specialist',
        role: 'Development & Integration',
        description: 'Handles complex technical implementations, API integrations, and system architecture decisions',
        platform: 'GitHub Copilot + Custom Tools',
        deployLink: 'https://github.com/features/copilot'
      });
    }

    if (userProfile.type === 'team' || userProfile.type === 'enterprise') {
      agents.push({
        id: 'agent_4',
        name: 'Team Coordination Agent',
        role: 'Collaboration Management',
        description: 'Facilitates team communication, manages project handoffs, and ensures alignment across stakeholders',
        platform: 'Slack/Teams Integration',
        deployLink: 'https://slack.com/apps'
      });
    }

    return agents.slice(0, 4); // Limit to 4 most relevant agents
  };


  const handleInputSubmit = async () => {
    if (!inputValue.trim()) return;
    
    setSession(prev => ({
      ...prev,
      rawInput: inputValue,
      currentStep: 2
    }));
    
    // Use the semantic analysis
    const analysis = await analyzeInput(inputValue);
    
    if (analysis.needsClarification && analysis.questions) {
      setChatMessages([{
        role: 'ai',
        content: "Got it! I understand your concept. Let me ask a few targeted questions to create the perfect blueprint for you."
      }]);
      
      // Start with first clarifying question
      setTimeout(() => {
        const firstQuestion = analysis.questions![0];
        setCurrentQuestion(firstQuestion);
        setChatMessages(prev => [...prev, {
          role: 'ai',
          content: firstQuestion
        }]);
      }, 1000);
    } else {
      // Skip to blueprint generation if no clarification needed
      setTimeout(() => {
        const blueprint = generateBlueprint(inputValue, []);
        setSession(prev => ({
          ...prev,
          lovablePrompt: blueprint.lovablePrompt,
          workflows: blueprint.workflows,
          agents: blueprint.agents,
          currentStep: 3
        }));
      }, 2000);
    }
    
    setInputValue('');
  };

  const handleClarificationResponse = (response: string) => {
    if (!response.trim()) return;
    
    setChatMessages(prev => [...prev, 
      { role: 'user', content: response },
    ]);
    
    const newClarifications = [...session.clarifications, response];
    setSession(prev => ({
      ...prev,
      clarifications: newClarifications
    }));
    
    // If we have enough clarifications, move to generation
    if (newClarifications.length >= 2) {
      setTimeout(() => {
        setChatMessages(prev => [...prev, {
          role: 'ai',
          content: "Perfect! I have everything I need. Give me a moment to create your personalized AI blueprint..."
        }]);
        
        setIsGenerating(true);
        
        setTimeout(() => {
          const blueprint = generateBlueprint(session.rawInput, newClarifications);
          setSession(prev => ({
            ...prev,
            lovablePrompt: blueprint.lovablePrompt,
            workflows: blueprint.workflows,
            agents: blueprint.agents,
            currentStep: 3
          }));
          setIsGenerating(false);
        }, 3000);
      }, 1000);
    } else {
      // Ask another question using the new contextual system
      const questions = generateClarifyingQuestions(newClarifications);
      const nextQuestion = questions[0];
      
      setTimeout(() => {
        setChatMessages(prev => [...prev, {
          role: 'ai',
          content: nextQuestion
        }]);
        setCurrentQuestion(nextQuestion);
      }, 1000);
    }
    
    setInputValue('');
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard!" });
  };

  // Speech recognition (mock implementation)
  const toggleSpeechRecognition = () => {
    setIsListening(!isListening);
    // In a real app, this would integrate with Web Speech API
  };

  const renderWelcomeScreen = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center space-y-8 max-w-5xl mx-auto"
    >
      {/* Background Animation Layer */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <NeuronLoop />
      </div>
      
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ 
          duration: 0.6, 
          ease: "easeOut",
          type: "spring",
          stiffness: 100,
          damping: 15
        }}
        className="relative z-20 mb-8"
      >
        <div className="flex justify-center">
          <img 
            src="/lovable-uploads/a9a8850e-efa8-4ff3-be18-e9ca23a403a2.png" 
            alt="Fractionl Logo" 
            className="w-24 h-24 object-contain"
            style={{ maxWidth: '96px', maxHeight: '96px' }}
          />
        </div>
      </motion.div>
      
      {/* Hero Text */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="relative z-10"
      >
        <h1 className="text-4xl md:text-6xl font-display font-bold tracking-tight bg-gradient-to-r from-violet-400 via-violet-500 to-violet-600 bg-clip-text text-transparent mb-4">
          Mindmaker for Individuals
        </h1>
        <p className="text-xl font-body font-light text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
          Turn your ideas into AI-powered blueprints with Lovable prompts, workflow automations, and agent recommendations
        </p>
      </motion.div>

      {/* Feature Cards */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 relative z-10"
      >
        <Card className="bg-gray-900/50 border-violet-500/20 p-6 hover:bg-gray-900/70 transition-all backdrop-blur-sm">
          <div className="flex justify-center mb-3">
            <Brain className="text-violet-400" size={32} />
          </div>
          <h3 className="text-white font-semibold mb-2">Semantic AI Understanding</h3>
          <p className="text-gray-300 text-sm">Natural language processing that understands your vision like a seasoned co-founder</p>
        </Card>
        <Card className="bg-gray-900/50 border-violet-500/20 p-6 hover:bg-gray-900/70 transition-all backdrop-blur-sm">
          <div className="flex justify-center mb-3">
            <Target className="text-violet-400" size={32} />
          </div>
          <h3 className="text-white font-semibold mb-2">Production-Ready Blueprints</h3>
          <p className="text-gray-300 text-sm">Get Lovable prompts, workflow automations, and AI agents ready to deploy</p>
        </Card>
        <Card className="bg-gray-900/50 border-violet-500/20 p-6 hover:bg-gray-900/70 transition-all backdrop-blur-sm">
          <div className="flex justify-center mb-3">
            <Zap className="text-violet-400" size={32} />
          </div>
          <h3 className="text-white font-semibold mb-2">Instant Implementation</h3>
          <p className="text-gray-300 text-sm">Go from messy idea to actionable blueprint in minutes, not months</p>
        </Card>
      </motion.div>

      {/* CTA Button */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.7 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative z-10"
      >
        <Button 
          onClick={handleStart}
          size="lg"
          className="bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-700 hover:to-violet-800 text-white px-8 py-4 text-lg rounded-full shadow-lg shadow-violet-500/25"
        >
          Start Building
          <ArrowRight className="ml-2" size={20} />
        </Button>
      </motion.div>

      <p className="text-gray-400 text-sm relative z-10">
        🧠 Semantic AI Analysis • 🛠️ Ready-to-Deploy • ⚡ Instant Results
      </p>
    </motion.div>
  );

  const renderInputStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      <Card className="bg-gray-800/50 border-violet-500/20 p-8 backdrop-blur-sm">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-heading font-bold text-white mb-3">
            🧠 Blurt It All Out
          </h2>
          <p className="text-gray-300 text-lg">
            What's the idea in your head? What are you trying to create, solve, or automate? 
            Tell me everything, like you're talking to a smart cofounder.
          </p>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <Textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="e.g., I want to help freelancers get clients by building something that automatically finds potential leads and drafts personalized outreach emails. I'm thinking it could scan LinkedIn and company websites, then use AI to write emails that don't sound like spam..."
              className="min-h-[200px] text-lg bg-background/50 backdrop-blur-sm border-primary/20 text-foreground placeholder:text-muted-foreground focus:border-primary/40 resize-none"
            />
            <Button
              onClick={toggleSpeechRecognition}
              variant="ghost"
              size="sm"
              className={`absolute bottom-4 right-4 ${isListening ? 'text-red-400' : 'text-gray-400'}`}
            >
              {isListening ? <MicOff size={20} /> : <Mic size={20} />}
            </Button>
          </div>
          
          <div className="flex justify-between items-center">
            <p className="text-gray-400 text-sm">
              💡 Don't worry about being perfect - I'll help clarify the details
            </p>
            <Button
              onClick={handleInputSubmit}
              disabled={!inputValue.trim()}
              className="bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-700 hover:to-violet-800 px-6 py-2 rounded-full"
            >
              Analyze My Idea
              <ArrowRight className="ml-2" size={16} />
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );

  const renderClarificationStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      <Card className="bg-gray-800/50 border-violet-500/20 p-8 backdrop-blur-sm">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-heading font-bold text-white mb-3">
            🔍 Let's Clarify Your Vision
          </h2>
          <p className="text-gray-300 text-lg">
            I understand your concept! Let me ask a few targeted questions to create the perfect blueprint.
          </p>
        </div>

        {/* Chat Messages */}
        <div className="space-y-4 mb-6 max-h-80 overflow-y-auto">
          {chatMessages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-3 rounded-xl shadow-sm ${
                  message.role === 'user'
                    ? 'bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--primary-glow))] text-primary-foreground ml-4'
                    : 'bg-secondary/50 backdrop-blur-sm text-foreground mr-4 border border-border/50'
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
          {isGenerating && (
            <div className="flex justify-start">
              <div className="bg-secondary/50 backdrop-blur-sm text-foreground px-4 py-3 rounded-xl border border-border/50 mr-4">
                <div className="flex items-center space-x-2">
                  <div className="animate-pulse">🧠</div>
                  <span>Generating your blueprint...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        {currentQuestion && !isGenerating && (
          <div className="space-y-4">
            <div className="relative">
              <Textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your response..."
                className="min-h-[100px] bg-background/50 backdrop-blur-sm border-primary/20 text-foreground placeholder:text-muted-foreground focus:border-primary/40"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleClarificationResponse(inputValue);
                  }
                }}
              />
            </div>
            
            <div className="flex justify-end">
              <Button
                onClick={() => handleClarificationResponse(inputValue)}
                disabled={!inputValue.trim()}
                className="bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-700 hover:to-violet-800 px-6 py-2 rounded-full"
              >
                Send
                <MessageCircle className="ml-2" size={16} />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </motion.div>
  );

  const renderBlueprintStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto space-y-6"
    >
      <Card className="bg-gray-800/50 border-violet-500/20 p-8 backdrop-blur-sm">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-heading font-bold text-white mb-3">
            🛠️ Your AI Blueprint is Ready!
          </h2>
          <p className="text-gray-300 text-lg">
            Here's your complete implementation plan with Lovable prompts, workflows, and AI agents.
          </p>
        </div>

        <Tabs defaultValue="frontend" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-900/50">
            <TabsTrigger value="frontend" className="data-[state=active]:bg-violet-600">
              🎨 Frontend
            </TabsTrigger>
            <TabsTrigger value="workflow" className="data-[state=active]:bg-violet-600">
              ⚙️ Workflows
            </TabsTrigger>
            <TabsTrigger value="agents" className="data-[state=active]:bg-violet-600">
              🤖 Agents
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="frontend" className="mt-6">
            <Card className="bg-gray-900/30 border-violet-500/20">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-white">
                  Lovable Prompt for Frontend
                  <Button
                    onClick={() => handleCopy(session.lovablePrompt)}
                    variant="ghost"
                    size="sm"
                    className="text-violet-400 hover:text-violet-300"
                  >
                    <Copy size={16} />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="whitespace-pre-wrap text-gray-300 text-sm bg-gray-800/50 p-4 rounded-lg overflow-x-auto">
                  {session.lovablePrompt}
                </pre>
                <div className="mt-4 flex gap-2">
                  <Button
                    onClick={() => window.open('https://lovable.dev', '_blank')}
                    className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                  >
                    🚀 Build with Lovable
                  </Button>
                  <Button
                    onClick={() => handleCopy(session.lovablePrompt)}
                    variant="outline"
                    className="border-violet-500/30 text-violet-400 hover:bg-violet-500/10"
                  >
                    <Copy size={16} className="mr-2" />
                    Copy Prompt
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="workflow" className="mt-6">
            <div className="space-y-4">
              {session.workflows.map((workflow) => (
                <Card key={workflow.id} className="bg-gray-900/30 border-violet-500/20">
                  <CardHeader>
                    <CardTitle className="text-white">{workflow.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-300 mb-4">{workflow.description}</p>
                    <div className="space-y-2">
                      <div>
                        <h4 className="text-violet-400 font-semibold">Tools:</h4>
                        <p className="text-gray-300">{workflow.tools.join(', ')}</p>
                      </div>
                      <div>
                        <h4 className="text-violet-400 font-semibold">Data Flow:</h4>
                        <p className="text-gray-300">{workflow.dataFlow}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              <div className="flex gap-2">
                <Button
                  onClick={() => window.open('https://zapier.com', '_blank')}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                >
                  ⚡ Build with Zapier
                </Button>
                <Button
                  onClick={() => window.open('https://n8n.io', '_blank')}
                  variant="outline"
                  className="border-violet-500/30 text-violet-400 hover:bg-violet-500/10"
                >
                  🔧 Try N8N
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="agents" className="mt-6">
            <div className="space-y-4">
              {session.agents.map((agent) => (
                <Card key={agent.id} className="bg-gray-900/30 border-violet-500/20">
                  <CardHeader>
                    <CardTitle className="text-white">{agent.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div>
                        <h4 className="text-violet-400 font-semibold">Role:</h4>
                        <p className="text-gray-300">{agent.role}</p>
                      </div>
                      <div>
                        <h4 className="text-violet-400 font-semibold">Description:</h4>
                        <p className="text-gray-300">{agent.description}</p>
                      </div>
                      <div>
                        <h4 className="text-violet-400 font-semibold">Platform:</h4>
                        <p className="text-gray-300">{agent.platform}</p>
                      </div>
                      {agent.deployLink && (
                        <Button
                          onClick={() => window.open(agent.deployLink, '_blank')}
                          variant="outline"
                          size="sm"
                          className="border-violet-500/30 text-violet-400 hover:bg-violet-500/10 mt-2"
                        >
                          Deploy Agent
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-8 justify-center">
          <Button
            onClick={() => {
              const data = {
                input: session.rawInput,
                clarifications: session.clarifications,
                blueprint: {
                  prompt: session.lovablePrompt,
                  workflows: session.workflows,
                  agents: session.agents
                }
              };
              handleCopy(JSON.stringify(data, null, 2));
            }}
            variant="outline"
            className="border-violet-500/30 text-violet-400 hover:bg-violet-500/10"
          >
            <Download size={16} className="mr-2" />
            Export JSON
          </Button>
          <Button
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-700 hover:to-violet-800"
          >
            Create Another Blueprint
          </Button>
        </div>
      </Card>
    </motion.div>
  );

  const renderContent = () => {
    if (session.currentStep === 1) return renderInputStep();
    if (session.currentStep === 2) return renderClarificationStep();
    if (session.currentStep === 3) return renderBlueprintStep();
    return null;
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-violet-600/10 to-blue-600/10 rounded-full blur-3xl"
          animate={{
            x: [0, 100, -50, 0],
            y: [0, -50, 100, 0],
            scale: [1, 1.2, 0.8, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Progress Ring */}
      {isStarted && (
        <div className="fixed top-6 right-6 z-50">
          <ProgressRing progress={(session.currentStep / 3) * 100} />
        </div>
      )}

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-8">
        <div className="w-full">
          {!isStarted ? renderWelcomeScreen() : renderContent()}
        </div>
      </div>

      {/* Enhanced gradient overlay */}
      <div className="fixed inset-0 opacity-30 pointer-events-none">
        <div 
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(circle at 20% 80%, rgba(139, 92, 246, 0.15) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(167, 139, 250, 0.15) 0%, transparent 50%),
              radial-gradient(circle at 40% 40%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)
            `
          }}
        />
      </div>
    </div>
  );
};

export default Index;
