import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DailyChallenge } from "@/components/literacy/DailyChallenge";
import { LearningPath } from "@/components/literacy/LearningPath";
import { StatsOverview } from "@/components/literacy/StatsOverview";
import { MainNav } from "@/components/MainNav";
import { Flame, Trophy } from "lucide-react";

export default function AILiteracy() {
  const [streak, setStreak] = useState(0);
  const [xp, setXp] = useState(0);

  return (
    <div className="min-h-screen bg-background">
      <MainNav />
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-end gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Flame className="h-4 w-4 text-orange-500" />
            <span className="font-semibold">{streak}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Trophy className="h-4 w-4 text-yellow-500" />
            <span className="font-semibold">{xp}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="daily" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8">
            <TabsTrigger value="learn">Learn</TabsTrigger>
            <TabsTrigger value="daily">Daily</TabsTrigger>
            <TabsTrigger value="stats">Stats</TabsTrigger>
          </TabsList>

          <TabsContent value="learn">
            <LearningPath />
          </TabsContent>

          <TabsContent value="daily">
            <DailyChallenge onComplete={(earnedXp) => {
              setXp(prev => prev + earnedXp);
              setStreak(prev => prev + 1);
            }} />
          </TabsContent>

          <TabsContent value="stats">
            <StatsOverview streak={streak} xp={xp} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
