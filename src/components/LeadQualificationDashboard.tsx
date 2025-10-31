import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Target,
  TrendingUp,
  DollarSign,
  Clock,
  User,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Download
} from 'lucide-react';

interface LeadQualificationData {
  id: string;
  qualification_criteria: any;
  pain_point_severity: number;
  budget_qualified: boolean;
  timeline_qualified: boolean;
  authority_level: number;
  need_urgency: number;
  fit_score: number;
  conversion_probability: number;
  recommended_service: string;
  next_action: string;
  follow_up_date: string;
  notes: string;
  created_at: string;
}

interface QualificationMetrics {
  totalLeads: number;
  qualifiedLeads: number;
  conversionRate: number;
  avgFitScore: number;
  highPriorityLeads: number;
}

const LeadQualificationDashboard: React.FC = () => {
  const [qualificationData, setQualificationData] = useState<LeadQualificationData[]>([]);
  const [metrics, setMetrics] = useState<QualificationMetrics>({
    totalLeads: 0,
    qualifiedLeads: 0,
    conversionRate: 0,
    avgFitScore: 0,
    highPriorityLeads: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadQualificationData();
  }, []);

  const loadQualificationData = async () => {
    try {
      // Temporarily disabled - tables not yet created
      setQualificationData([]);
      calculateMetrics([]);
    } catch (error) {
      console.error('Error loading qualification data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateMetrics = (data: LeadQualificationData[]) => {
    const totalLeads = data.length;
    const qualifiedLeads = data.filter(d => d.budget_qualified && d.timeline_qualified).length;
    const conversionRate = totalLeads > 0 ? (qualifiedLeads / totalLeads) * 100 : 0;
    const avgFitScore = totalLeads > 0 ? data.reduce((sum, d) => sum + (d.fit_score || 0), 0) / totalLeads : 0;
    const highPriorityLeads = data.filter(d => (d.conversion_probability || 0) > 0.7).length;

    setMetrics({
      totalLeads,
      qualifiedLeads,
      conversionRate,
      avgFitScore,
      highPriorityLeads
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-500/10';
    if (score >= 60) return 'bg-yellow-500/10';
    return 'bg-red-500/10';
  };

  const getPriorityLevel = (probability: number) => {
    if (probability >= 0.8) return { label: 'High', color: 'bg-red-500/10 text-red-600 border-red-500/20' };
    if (probability >= 0.6) return { label: 'Medium', color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' };
    return { label: 'Low', color: 'bg-green-500/10 text-green-600 border-green-500/20' };
  };

  const generateBlueprint = async (leadData: LeadQualificationData) => {
    try {
      const response = await supabase.functions.invoke('generate-pdf-blueprint', {
        body: { leadData }
      });

      if (response.error) throw response.error;

      toast({
        title: "Success",
        description: "Business blueprint generated successfully",
      });
    } catch (error) {
      console.error('Error generating blueprint:', error);
      toast({
        title: "Error",
        description: "Failed to generate blueprint",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Leads</p>
                  <p className="text-2xl font-bold">{metrics.totalLeads}</p>
                </div>
                <Target className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Qualified</p>
                  <p className="text-2xl font-bold text-green-600">{metrics.qualifiedLeads}</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Conversion Rate</p>
                  <p className="text-2xl font-bold">{metrics.conversionRate.toFixed(1)}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Fit Score</p>
                  <p className={`text-2xl font-bold ${getScoreColor(metrics.avgFitScore)}`}>
                    {metrics.avgFitScore.toFixed(0)}
                  </p>
                </div>
                <User className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Lead Details */}
      <Card>
        <CardHeader>
          <CardTitle>Lead Qualification Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {qualificationData.map((lead, index) => (
              <motion.div
                key={lead.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border rounded-lg p-4 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={getPriorityLevel(lead.conversion_probability || 0).color}>
                        {getPriorityLevel(lead.conversion_probability || 0).label} Priority
                      </Badge>
                      {lead.budget_qualified && lead.timeline_qualified && (
                        <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                          Qualified
                        </Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Fit Score</p>
                        <div className="flex items-center gap-2">
                          <Progress value={lead.fit_score || 0} className="w-16" />
                          <span className={`font-medium ${getScoreColor(lead.fit_score || 0)}`}>
                            {Math.round(lead.fit_score || 0)}%
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Pain Severity</p>
                        <p className="font-medium">{lead.pain_point_severity || 0}/10</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Authority Level</p>
                        <p className="font-medium">{lead.authority_level || 0}/10</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Need Urgency</p>
                        <p className="font-medium">{lead.need_urgency || 0}/10</p>
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => generateBlueprint(lead)}
                    className="gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Blueprint
                  </Button>
                </div>

                {lead.recommended_service && (
                  <div className="bg-primary/5 p-3 rounded-lg">
                    <p className="text-sm font-medium text-primary">Recommended Service</p>
                    <p className="text-sm">{lead.recommended_service}</p>
                  </div>
                )}

                {lead.next_action && (
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Next Action</p>
                      <p className="text-sm text-muted-foreground">{lead.next_action}</p>
                      {lead.follow_up_date && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                          <Calendar className="h-3 w-3" />
                          Follow up: {new Date(lead.follow_up_date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}

            {qualificationData.length === 0 && (
              <div className="text-center py-8">
                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No qualification data yet</p>
                <p className="text-sm text-muted-foreground">Data will appear as you engage with the AI assistant</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LeadQualificationDashboard;