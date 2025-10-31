import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { 
  TrendingUp, 
  Target, 
  Clock, 
  DollarSign, 
  Users, 
  Briefcase,
  AlertCircle,
  CheckCircle,
  Star
} from 'lucide-react';

interface UserProfile {
  name: string;
  industry: string;
  company_size: string;
  business_type: string;
  pain_points: string[];
  goals: string[];
  budget_range: string;
  timeline: string;
  lead_score: number;
  qualification_status: string;
}

interface BusinessContext {
  context_type: string;
  context_key: string;
  context_value: string;
  confidence_score: number;
}

interface LeadQualification {
  pain_point_severity: number;
  budget_qualified: boolean;
  timeline_qualified: boolean;
  authority_level: number;
  need_urgency: number;
  fit_score: number;
  conversion_probability: number;
  recommended_service: string;
  next_action: string;
}

const BusinessInsights: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [businessContext, setBusinessContext] = useState<BusinessContext[]>([]);
  const [leadQualification, setLeadQualification] = useState<LeadQualification | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBusinessInsights();
  }, []);

  const loadBusinessInsights = async () => {
    try {
      // Temporarily disabled - tables not yet created
      setLoading(false);
    } catch (error) {
      console.error('Error loading business insights:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const getQualificationColor = (status: string) => {
    switch (status) {
      case 'hot': return 'bg-destructive text-destructive-foreground';
      case 'qualified': return 'bg-warning text-warning-foreground';
      case 'lead': return 'bg-info text-info-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getUrgencyLevel = (score: number) => {
    if (score >= 8) return { label: 'High', color: 'text-destructive' };
    if (score >= 5) return { label: 'Medium', color: 'text-warning' };
    return { label: 'Low', color: 'text-muted-foreground' };
  };

  return (
    <div className="space-y-6">
      {/* Profile Overview */}
      {profile && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    {profile.name || 'Business Profile'}
                  </CardTitle>
                  <CardDescription>Your business context and insights</CardDescription>
                </div>
                <Badge 
                  className={getQualificationColor(profile.qualification_status)}
                >
                  {profile.qualification_status.charAt(0).toUpperCase() + profile.qualification_status.slice(1)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium flex items-center gap-1">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    Industry
                  </p>
                  <p className="text-sm text-muted-foreground">{profile.industry || 'Not specified'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium flex items-center gap-1">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    Company Size
                  </p>
                  <p className="text-sm text-muted-foreground">{profile.company_size || 'Not specified'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium flex items-center gap-1">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    Budget Range
                  </p>
                  <p className="text-sm text-muted-foreground">{profile.budget_range || 'Not specified'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium flex items-center gap-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    Timeline
                  </p>
                  <p className="text-sm text-muted-foreground">{profile.timeline || 'Not specified'}</p>
                </div>
              </div>

              {profile.lead_score > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium flex items-center gap-1">
                      <Star className="h-4 w-4 text-primary" />
                      Lead Score
                    </p>
                    <span className="text-sm font-medium">{profile.lead_score}/100</span>
                  </div>
                  <Progress value={profile.lead_score} className="h-2" />
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Pain Points & Goals */}
      {profile && (profile.pain_points?.length > 0 || profile.goals?.length > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className="grid md:grid-cols-2 gap-4"
        >
          {profile.pain_points?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <AlertCircle className="h-5 w-5" />
                  Pain Points
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {profile.pain_points.map((point, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-destructive rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-sm">{point}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {profile.goals?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Target className="h-5 w-5" />
                  Goals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {profile.goals.map((goal, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <p className="text-sm">{goal}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      )}

      {/* Lead Qualification Metrics */}
      {leadQualification && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Qualification Insights
              </CardTitle>
              <CardDescription>AI-powered analysis of your business readiness</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary mb-1">
                    {Math.round(leadQualification.conversion_probability * 100)}%
                  </div>
                  <p className="text-xs text-muted-foreground">Conversion Probability</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary mb-1">
                    {Math.round(leadQualification.fit_score * 100)}%
                  </div>
                  <p className="text-xs text-muted-foreground">Solution Fit</p>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold mb-1 ${getUrgencyLevel(leadQualification.need_urgency || 0).color}`}>
                    {getUrgencyLevel(leadQualification.need_urgency || 0).label}
                  </div>
                  <p className="text-xs text-muted-foreground">Urgency Level</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary mb-1">
                    {leadQualification.authority_level || 0}/5
                  </div>
                  <p className="text-xs text-muted-foreground">Authority Level</p>
                </div>
              </div>

              {leadQualification.recommended_service && (
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Recommended Next Step</h4>
                  <p className="text-sm text-muted-foreground mb-2">{leadQualification.recommended_service}</p>
                  {leadQualification.next_action && (
                    <Badge variant="outline">{leadQualification.next_action}</Badge>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Business Context */}
      {businessContext.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Business Context</CardTitle>
              <CardDescription>Key insights gathered from your conversations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {businessContext.map((context, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="text-sm font-medium capitalize">{context.context_type}</p>
                      <p className="text-xs text-muted-foreground">{context.context_key}: {context.context_value}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress 
                        value={context.confidence_score * 100} 
                        className="w-16 h-2" 
                      />
                      <span className="text-xs text-muted-foreground">
                        {Math.round(context.confidence_score * 100)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default BusinessInsights;