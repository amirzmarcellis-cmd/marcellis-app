import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, User, Phone, Mail, Calendar, Star, FileText, Clock, Target } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { GlassCard } from "@/components/ui/GlassCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

// Currency conversion rates (approximate, to SAR base)
const CURRENCY_TO_SAR: { [key: string]: number } = {
  'SAR': 1,
  'AED': 1.02, // 1 AED ≈ 1.02 SAR
  'USD': 3.75,
  'EUR': 4.10,
  'GBP': 4.75,
  'INR': 0.045,
  'PKR': 0.013,
  'EGP': 0.076,
};

// Parse salary string and convert to target currency
const convertSalary = (salaryStr: string | null, targetCurrency: string = 'SAR'): string => {
  if (!salaryStr) return 'N/A';
  
  // Extract numbers and currency from string (e.g., "35000 aed to 40000 aed")
  const numbers = salaryStr.match(/\d+/g)?.map(n => parseInt(n)) || [];
  const currencyMatch = salaryStr.match(/aed|sar|usd|eur|gbp|inr|pkr|egp/gi);
  const sourceCurrency = currencyMatch ? currencyMatch[0].toUpperCase() : 'AED';
  
  if (numbers.length === 0) return salaryStr;
  
  // If already in target currency, just format
  if (sourceCurrency === targetCurrency) {
    if (numbers.length === 2) {
      return `${targetCurrency} ${numbers[0].toLocaleString()} - ${numbers[1].toLocaleString()}`;
    }
    return `${targetCurrency} ${numbers[0].toLocaleString()}`;
  }
  
  // Convert to target currency
  const conversionRate = CURRENCY_TO_SAR[sourceCurrency] || 1;
  const targetRate = CURRENCY_TO_SAR[targetCurrency] || 1;
  const finalRate = conversionRate / targetRate;
  
  if (numbers.length === 2) {
    const min = Math.round(numbers[0] * finalRate);
    const max = Math.round(numbers[1] * finalRate);
    return `${targetCurrency} ${min.toLocaleString()} - ${max.toLocaleString()} (converted from ${sourceCurrency})`;
  }
  
  const converted = Math.round(numbers[0] * finalRate);
  return `${targetCurrency} ${converted.toLocaleString()} (converted from ${sourceCurrency})`;
};

export default function CallLogDetailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState<any>(null);
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const recordId = searchParams.get('recordId');
  const jobId = searchParams.get('jobId');

  useEffect(() => {
    if (recordId) {
      fetchRecord();
    }
  }, [recordId]);

  const fetchRecord = async () => {
    try {
      setLoading(true);
      console.log('Searching for record with ID:', recordId);
      
      // Query the Jobs_CVs table using recordid field
      const { data, error } = await (supabase as any)
        .from('Jobs_CVs')
        .select('*')
        .eq('recordid', recordId)
        .maybeSingle();
        
      console.log('Query result:', { data, error });
      
      if (error) {
        console.error('Error fetching record:', error);
      }

      if (error) throw error;
      setRecord(data);
      
      // Fetch job details to get currency
      if (data?.job_id) {
        const { data: jobData } = await supabase
          .from('Jobs')
          .select('Currency, job_title')
          .eq('job_id', data.job_id)
          .single();
        
        if (jobData) {
          setJob(jobData);
        }
      }
    } catch (error) {
      console.error('Error fetching record:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 8) return "bg-emerald-500/20 text-emerald-400 border-emerald-500/50";
    if (score >= 6) return "bg-amber-500/20 text-amber-400 border-amber-500/50";
    return "bg-rose-500/20 text-rose-400 border-rose-500/50";
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="container mx-auto p-6">
        <SectionHeader
          title="Record Not Found"
          subtitle="The requested call log record could not be found"
        />
        <Button onClick={() => {
          if (jobId) {
            const fromTabParam = searchParams.get('fromTab');
            const fromTab = fromTabParam === 'shortlist' ? 'shortlist' : 'boolean-search';
            navigate(`/job/${jobId}`, {
              state: { tab: fromTab }
            });
          } else {
            navigate('/jobs');
          }
        }} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <SectionHeader
        title="Call Log Details"
        subtitle={`Complete information for ${record.candidate_name || 'candidate'}`}
        actions={
          <Button onClick={() => {
            if (jobId) {
              const fromTabParam = searchParams.get('fromTab');
              const fromTab = fromTabParam === 'shortlist' ? 'shortlist' : 'boolean-search';
              navigate(`/job/${jobId}`, {
                state: { tab: fromTab }
              });
            } else {
              navigate('/jobs');
            }
          }} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        }
      />

      {/* Candidate Overview */}
      <GlassCard>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src="" />
              <AvatarFallback className="bg-primary/10 text-primary">
                {record.candidate_name?.charAt(0) || 'C'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-xl font-semibold">{record.candidate_name || 'N/A'}</h3>
              <p className="text-muted-foreground">{record.candidate_email || 'No email'}</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{record.candidate_phone_number || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{record.candidate_email || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Notice: {record.notice_period || 'N/A'}</span>
            </div>
          </div>
        </CardContent>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Record Information */}
        <GlassCard>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Record Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Record ID:</span>
                <span className="font-mono text-sm">{record.recordid}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Job ID:</span>
                <span className="font-mono text-sm">{record.job_id}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">ITRIS Job ID:</span>
                <span className="font-mono text-sm">{record.itris_job_id || 'N/A'}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">User ID:</span>
                <span className="font-mono text-sm">{record.user_id || 'N/A'}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Recruiter ID:</span>
                <span className="font-mono text-sm">{record.recruiter_id || 'N/A'}</span>
              </div>
            </div>
          </CardContent>
        </GlassCard>

        {/* Scores */}
        <GlassCard>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Scores & Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">CV Score:</span>
                <Badge className={getScoreBadgeColor(record.cv_score || 0)}>
                  {record.cv_score || 'N/A'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">After Call Score:</span>
                <Badge className={getScoreBadgeColor(record.after_call_score || 0)}>
                  {record.after_call_score || 'N/A'}
                </Badge>
              </div>
            </div>
            
            {record.cv_score_reason && (
              <div className="space-y-2">
                <span className="text-sm font-medium text-muted-foreground">CV Score Reason:</span>
                <p className="text-sm p-3 bg-secondary/50 rounded-lg border">{record.cv_score_reason}</p>
              </div>
            )}
            
            {record.after_call_reason && (
              <div className="space-y-2">
                <span className="text-sm font-medium text-muted-foreground">After Call Reason:</span>
                <p className="text-sm p-3 bg-secondary/50 rounded-lg border">{record.after_call_reason}</p>
              </div>
            )}
          </CardContent>
        </GlassCard>
      </div>

      {/* Salary Information */}
      <GlassCard>
        <CardHeader>
          <CardTitle>Salary Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <span className="text-muted-foreground">Current Salary:</span>
              <p className="font-medium">{record.current_salary || 'N/A'}</p>
            </div>
            <div className="space-y-2">
              <span className="text-muted-foreground">Salary Expectations:</span>
              <div className="space-y-1">
                <p className="font-medium text-sm text-muted-foreground">{record.salary_expectations || 'N/A'}</p>
                {job?.Currency && record.salary_expectations && (
                  <p className="font-medium text-primary">
                    {convertSalary(record.salary_expectations, job.Currency)}
                  </p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </GlassCard>

      {/* Call Information */}
      <GlassCard>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Call Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <span className="text-muted-foreground">Contacted:</span>
              <p className="font-medium">{record.contacted || 'N/A'}</p>
            </div>
            <div className="space-y-2">
              <span className="text-muted-foreground">Call Count:</span>
              <p className="font-medium">{record.callcount || 'N/A'}</p>
            </div>
            <div className="space-y-2">
              <span className="text-muted-foreground">Duration:</span>
              <p className="font-medium">{record.duration || 'N/A'}</p>
            </div>
            <div className="space-y-2">
              <span className="text-muted-foreground">Last Call:</span>
              <p className="font-medium">{record.lastcalltime || 'N/A'}</p>
            </div>
            <div className="space-y-2">
              <span className="text-muted-foreground">Recording:</span>
              <p className="font-medium">{record.recording ? 'Available' : 'N/A'}</p>
            </div>
          </div>
        </CardContent>
      </GlassCard>

      {/* Interview Questions & Assessment */}
      {(record.two_questions_of_interview || record.after_call_pros || record.after_call_cons) && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {record.two_questions_of_interview && (
            <GlassCard>
              <CardHeader>
                <CardTitle>Interview Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">{record.two_questions_of_interview}</p>
              </CardContent>
            </GlassCard>
          )}
          
          {record.after_call_pros && (
            <GlassCard>
              <CardHeader>
                <CardTitle className="text-emerald-400">Pros</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-emerald-300">{record.after_call_pros}</p>
              </CardContent>
            </GlassCard>
          )}
          
          {record.after_call_cons && (
            <GlassCard>
              <CardHeader>
                <CardTitle className="text-rose-400">Cons</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-rose-300">{record.after_call_cons}</p>
              </CardContent>
            </GlassCard>
          )}
        </div>
      )}

      {/* Transcript */}
      {record.transcript && (
        <GlassCard>
          <CardHeader>
            <CardTitle>Call Transcript</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-96 overflow-y-auto">
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{record.transcript}</p>
            </div>
          </CardContent>
        </GlassCard>
      )}

      {/* Qualifications */}
      {record.qualifications && (
        <GlassCard>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Qualifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-secondary/50 rounded-lg border">
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{record.qualifications}</p>
            </div>
          </CardContent>
        </GlassCard>
      )}

      {/* Timeline Information */}
      <GlassCard>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <span className="text-muted-foreground">Longlisted At:</span>
              <p className="font-medium">{record.longlisted_at || 'N/A'}</p>
            </div>
            <div className="space-y-2">
              <span className="text-muted-foreground">Shortlisted At:</span>
              <p className="font-medium">{record.shortlisted_at || 'N/A'}</p>
            </div>
            <div className="space-y-2">
              <span className="text-muted-foreground">Notes Updated At:</span>
              <p className="font-medium">{record.notes_updated_at || 'N/A'}</p>
            </div>
          </div>
        </CardContent>
      </GlassCard>

      {/* Notes */}
      {record.notes && (
        <GlassCard>
          <CardHeader>
            <CardTitle>
              Notes
              {record.notes_updated_by && (
                <span className="text-muted-foreground font-normal text-sm ml-2">
                  (Updated by: {record.notes_updated_by})
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{record.notes}</p>
          </CardContent>
        </GlassCard>
      )}
    </div>
  );
}