import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface DailyChallengeProps {
  onComplete: (xp: number) => void;
}

const challenges = [
  {
    id: 1,
    level: "Foundation Level",
    duration: "5-7 min",
    title: "Prompt Engineering Fundamentals",
    question: "Which prompt structure is most effective for getting specific, actionable outputs from an AI model?",
    options: [
      "Write me something about climate change",
      "You are an environmental scientist. Provide 3 specific policy recommendations to reduce urban carbon emissions, with implementation timelines and expected impact percentages.",
      "Tell me about carbon emissions",
      "Climate change is important. What should we do?"
    ],
    correctIndex: 1,
    xpReward: 50
  }
];

export function DailyChallenge({ onComplete }: DailyChallengeProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [currentChallenge] = useState(challenges[0]);
  const { toast } = useToast();

  const handleSubmit = () => {
    const isCorrect = selectedAnswer === currentChallenge.correctIndex.toString();
    
    if (isCorrect) {
      toast({
        title: "Correct! 🎉",
        description: `You earned ${currentChallenge.xpReward} XP`,
      });
      onComplete(currentChallenge.xpReward);
    } else {
      toast({
        title: "Not quite right",
        description: "Try again tomorrow!",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <Badge variant="secondary">{currentChallenge.level}</Badge>
            <span className="text-sm text-muted-foreground">{currentChallenge.duration}</span>
          </div>
          <CardTitle className="text-2xl">{currentChallenge.title}</CardTitle>
          <CardDescription className="text-base mt-4">
            {currentChallenge.question}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer} className="space-y-4">
            {currentChallenge.options.map((option, index) => (
              <div key={index} className="flex items-start space-x-3 p-4 rounded-lg border hover:bg-accent/50 transition-colors">
                <RadioGroupItem value={index.toString()} id={`option-${index}`} className="mt-1" />
                <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer text-sm leading-relaxed">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
          
          <Button 
            onClick={handleSubmit} 
            disabled={!selectedAnswer}
            className="w-full mt-6"
            size="lg"
          >
            Submit Answer
          </Button>
        </CardContent>
      </Card>

      <div className="mt-6 text-center text-sm text-muted-foreground">
        Complete your daily challenge to maintain your streak
      </div>
    </div>
  );
}
