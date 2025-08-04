import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { MetricCard } from "@/components/dashboard/MetricCard"
import { RecentCallsTable } from "@/components/dashboard/RecentCallsTable"
import { CallAnalyticsChart } from "@/components/dashboard/CallAnalyticsChart"
import { 
  Phone, 
  Users, 
  TrendingUp, 
  Clock, 
  CheckCircle,
  Target
} from "lucide-react"

const Index = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">AI Recruiter Dashboard</h1>
          <p className="text-muted-foreground">Monitor your AI calling performance and candidate pipeline</p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Calls Today"
            value="127"
            change="+12% from yesterday"
            changeType="positive"
            icon={Phone}
            description="Automated calls completed"
          />
          <MetricCard
            title="Success Rate"
            value="84.2%"
            change="+5.1% from last week"
            changeType="positive"
            icon={Target}
            description="Successful connections"
          />
          <MetricCard
            title="Interested Candidates"
            value="32"
            change="+8 today"
            changeType="positive"
            icon={CheckCircle}
            description="Positive responses"
          />
          <MetricCard
            title="Avg Call Duration"
            value="9:24"
            change="-1:12 from average"
            changeType="neutral"
            icon={Clock}
            description="Average conversation time"
          />
        </div>

        {/* Charts and Tables Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CallAnalyticsChart />
          <RecentCallsTable />
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricCard
            title="Pipeline Candidates"
            value="1,247"
            change="+23 this week"
            changeType="positive"
            icon={Users}
            description="Active prospects"
          />
          <MetricCard
            title="Calls Scheduled"
            value="45"
            change="Next 24 hours"
            changeType="neutral"
            icon={Clock}
            description="Upcoming automated calls"
          />
          <MetricCard
            title="Conversion Rate"
            value="25.3%"
            change="+2.1% improvement"
            changeType="positive"
            icon={TrendingUp}
            description="Interest to interview ratio"
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
