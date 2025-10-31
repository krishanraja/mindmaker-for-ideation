import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, CheckCircle2, Lock } from "lucide-react";

const learningModules = [
  {
    id: 1,
    title: "Prompt Engineering Basics",
    description: "Master the fundamentals of crafting effective AI prompts",
    level: "Foundation",
    completed: true,
    locked: false,
    lessons: 5
  },
  {
    id: 2,
    title: "AI Model Selection",
    description: "Learn to choose the right AI model for your use case",
    level: "Foundation",
    completed: false,
    locked: false,
    lessons: 4
  },
  {
    id: 3,
    title: "Advanced Prompt Patterns",
    description: "Explore sophisticated prompting techniques",
    level: "Intermediate",
    completed: false,
    locked: true,
    lessons: 6
  }
];

export function LearningPath() {
  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Your Learning Path</h2>
        <p className="text-muted-foreground">Progress through structured AI literacy modules</p>
      </div>

      {learningModules.map((module) => (
        <Card key={module.id} className={module.locked ? "opacity-60" : ""}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <CardTitle className="text-xl">{module.title}</CardTitle>
                  {module.completed && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                  {module.locked && <Lock className="h-5 w-5 text-muted-foreground" />}
                </div>
                <CardDescription>{module.description}</CardDescription>
              </div>
              <Badge variant={module.level === "Foundation" ? "default" : "secondary"}>
                {module.level}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <BookOpen className="h-4 w-4" />
              <span>{module.lessons} lessons</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
