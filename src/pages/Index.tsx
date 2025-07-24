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

  // Enhanced semantic AI analysis function
  const analyzeInput = async (input: string): Promise<{ needsClarification: boolean; questions?: string[] }> => {
    setIsGenerating(true);
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Semantic analysis with contextual understanding
    const inputLower = input.toLowerCase();
    const words = inputLower.split(/\s+/);
    
    // Analyze intent and context
    const hasBusinessIntent = /\b(business|startup|company|revenue|monetize|sell|customer|client|market)\b/.test(inputLower);
    const hasPersonalIntent = /\b(personal|myself|my own|hobby|side project|learning)\b/.test(inputLower);
    const hasProblemStatement = /\b(problem|issue|challenge|pain|difficult|frustrating|annoying)\b/.test(inputLower);
    const hasSolutionHint = /\b(solution|solve|fix|help|automate|simplify|streamline|improve)\b/.test(inputLower);
    const hasTargetAudience = /\b(user|customer|people|team|freelancer|business|developer|designer)\b/.test(inputLower);
    const hasTechPreference = /\b(app|website|web|mobile|desktop|saas|tool|platform|dashboard|api)\b/.test(inputLower);
    const hasWorkflow = /\b(process|workflow|automation|integrate|connect|sync|trigger)\b/.test(inputLower);
    
    // Contextual question generation based on missing elements
    const questions = [];
    const context = { hasBusinessIntent, hasPersonalIntent, hasProblemStatement, hasSolutionHint };
    
    if (!hasProblemStatement && !hasSolutionHint) {
      questions.push("I can sense you have an idea brewing! Can you help me understand the core problem you're trying to solve? What's the pain point that sparked this idea?");
    }
    
    if (!hasTargetAudience) {
      if (hasBusinessIntent) {
        questions.push("Who's your ideal customer for this? Are you thinking B2B, B2C, or maybe serving a specific niche like freelancers or small businesses?");
      } else {
        questions.push("Who would benefit most from this solution? Are you building this for yourself, your team, or a broader group of people?");
      }
    }
    
    if (!hasTechPreference) {
      if (hasWorkflow) {
        questions.push("This sounds like it could involve some automation! Are you envisioning this as a web dashboard, mobile app, or maybe something that works behind the scenes connecting different tools?");
      } else {
        questions.push("How do you picture people interacting with this? A simple web interface, mobile app, or something more complex?");
      }
    }
    
    setIsGenerating(false);
    
    // Need clarification if we're missing key context
    if (questions.length > 0) {
      return { needsClarification: true, questions: questions.slice(0, 3) }; // Max 3 questions
    }
    
    return { needsClarification: false };
  };

  const generateClarifyingQuestions = (responses: string[]): string[] => {
    // Generate contextual follow-up questions based on previous responses
    const lastResponse = responses[responses.length - 1]?.toLowerCase() || '';
    const allResponses = responses.join(' ').toLowerCase();
    
    // Smart contextual questions based on conversation flow
    if (responses.length === 1) {
      if (lastResponse.includes('automat')) {
        return ["That's interesting! What manual tasks are eating up most of your time right now that you'd love to automate?"];
      } else if (lastResponse.includes('data') || lastResponse.includes('track')) {
        return ["Data-driven thinking, I like it! What specific metrics or insights are you hoping to capture and analyze?"];
      } else if (lastResponse.includes('team') || lastResponse.includes('collaborat')) {
        return ["Team productivity is huge! What's the biggest bottleneck in your current collaboration process?"];
      } else {
        return ["I'm getting a clearer picture! What would 'success' look like for your users? What's the key outcome they should achieve?"];
      }
    } else if (responses.length === 2) {
      if (allResponses.includes('business') || allResponses.includes('revenue')) {
        return ["Smart business focus! Any existing tools or platforms you'd want this to integrate with to maximize value?"];
      } else {
        return ["Almost there! What's the #1 feature that would make users say 'I can't live without this tool'?"];
      }
    }
    
    return ["Perfect! I think I have everything I need to create your blueprint."];
  };

  const generateBlueprint = (input: string, clarifications: string[]) => {
    const combinedContext = `${input} ${clarifications.join(' ')}`;
    
    // Mock AI generation - in real app this would call an AI service
    const lovablePrompt = `Create a "${extractTitle(combinedContext)}" web application.

**Core Features:**
${generateFeatureList(combinedContext)}

**Design Requirements:**
- Modern, clean interface with dark theme
- Responsive design for mobile and desktop
- Intuitive user experience with minimal learning curve
- Professional color scheme with accent colors

**User Experience:**
${generateUXDescription(combinedContext)}

**Technical Notes:**
- Built with React and TypeScript
- Use Tailwind CSS for styling
- Include loading states and error handling
- Implement proper form validation`;

    const workflows = generateWorkflows(combinedContext);
    const agents = generateAgents(combinedContext);

    return { lovablePrompt, workflows, agents };
  };

  const extractTitle = (context: string) => {
    if (context.toLowerCase().includes('client')) return 'Client Management Hub';
    if (context.toLowerCase().includes('content')) return 'Content Creation Assistant';
    if (context.toLowerCase().includes('automat')) return 'Smart Automation Dashboard';
    return 'AI-Powered Solution';
  };

  const generateFeatureList = (context: string) => {
    const features = [
      '- User dashboard with key metrics and insights',
      '- Input forms with smart validation',
      '- Real-time processing and feedback',
      '- Export and sharing capabilities',
      '- Settings and customization options'
    ];
    
    if (context.toLowerCase().includes('client')) {
      features.unshift('- Client contact management and tracking');
      features.unshift('- Lead scoring and prioritization');
    }
    
    return features.join('\n');
  };

  const generateUXDescription = (context: string) => {
    return `Users should be able to quickly input their information, see immediate results, and take action on the insights provided. The interface should guide users through the process step-by-step while allowing power users to access advanced features.`;
  };

  const generateWorkflows = (context: string): WorkflowStep[] => {
    return [
      {
        id: 'workflow_1',
        title: 'Data Collection & Processing',
        description: 'Automatically collect and structure user input data',
        tools: ['Zapier', 'Airtable', 'Webhooks'],
        dataFlow: 'Form Input → Data Validation → Store in Database → Trigger Processing'
      },
      {
        id: 'workflow_2',
        title: 'AI Analysis & Enhancement',
        description: 'Process data through AI models for insights',
        tools: ['OpenAI API', 'Make.com', 'Custom Functions'],
        dataFlow: 'Raw Data → AI Processing → Generate Insights → Format Results'
      },
      {
        id: 'workflow_3',
        title: 'Notification & Follow-up',
        description: 'Automated communication and next steps',
        tools: ['Email automation', 'Slack integration', 'SMS'],
        dataFlow: 'Results Ready → Send Notification → Schedule Follow-up → Track Engagement'
      }
    ];
  };

  const generateAgents = (context: string): AgentSuggestion[] => {
    return [
      {
        id: 'agent_1',
        name: 'Content Optimizer',
        role: 'Content Enhancement',
        description: 'Reviews and optimizes content for engagement and clarity',
        platform: 'Custom GPT',
        deployLink: 'https://chat.openai.com/gpts'
      },
      {
        id: 'agent_2',
        name: 'Data Analyst Assistant',
        role: 'Data Processing',
        description: 'Analyzes patterns and generates actionable insights from user data',
        platform: 'Claude/Anthropic',
        deployLink: 'https://claude.ai'
      },
      {
        id: 'agent_3',
        name: 'Workflow Coordinator',
        role: 'Process Management',
        description: 'Manages multi-step processes and ensures smooth handoffs',
        platform: 'N8N',
        deployLink: 'https://n8n.io'
      }
    ];
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
