import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { CalendarDateRangePicker } from "@/components/reports/DateRangePicker";
import { ReportStats } from "@/components/reports/ReportStats";
import { EmployeeLeaderboard } from "@/components/reports/EmployeeLeaderboard";
import { TaskStatusChart } from "@/components/reports/TaskStatusChart";
import { PointsTimeChart } from "@/components/reports/PointsTimeChart";
import { TopEmployeesChart } from "@/components/reports/TopEmployeesChart";
import { Download } from "lucide-react";
import { useTasks } from "@/contexts/TaskContext";
import { ReportFilters } from "@/components/reports/ReportFilters";
import { addDays, format } from "date-fns";
import { DateRange } from "react-day-picker";

const ReportsPage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { tasks } = useTasks();
  
  // Default date range - last 30 days
  const [dateRange, setDateRange] = useState<DateRange>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });
  
  const [selectedTab, setSelectedTab] = useState<string>("overview");
  const [filters, setFilters] = useState({
    employee: "all",
    category: "all",
    status: "all",
  });

  // Redirect non-admin users away from this page
  if (currentUser?.role !== "admin") {
    return <Navigate to="/dashboard" />;
  }

  // Handler for date range changes that ensures both from and to are set
  const handleDateRangeChange = (range: DateRange) => {
    // Make sure we have both from and to dates
    if (range.from && !range.to) {
      // If only from is set, keep the current to date
      setDateRange({ ...range, to: dateRange.to });
    } else {
      setDateRange(range);
    }
  };

  const handleExportReport = () => {
    // In a real app, this would generate a PDF or CSV
    console.log("Exporting report for date range:", dateRange);
    const fileName = `report-${format(dateRange.from!, "yyyy-MM-dd")}-to-${format(dateRange.to!, "yyyy-MM-dd")}`;
    
    // Mock export functionality
    setTimeout(() => {
      alert(`Report "${fileName}" would be generated in a real application`);
    }, 1000);
  };

  document.title = "Performance Reports | TaskSync Pilot";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Performance Reports</h1>
          <p className="text-muted-foreground">
            Analyze task performance and employee productivity
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <CalendarDateRangePicker 
            date={dateRange} 
            onDateChange={handleDateRangeChange} 
          />
          <Button onClick={handleExportReport} className="gap-1">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <ReportFilters 
        filters={filters} 
        setFilters={setFilters} 
      />

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="employees">Employee Performance</TabsTrigger>
          <TabsTrigger value="tasks">Task Analysis</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <ReportStats dateRange={dateRange} filters={filters} />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Task Status Distribution</CardTitle>
                <CardDescription>
                  Breakdown of tasks by current status
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <TaskStatusChart dateRange={dateRange} filters={filters} />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Points Over Time</CardTitle>
                <CardDescription>
                  Points earned during selected period
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <PointsTimeChart dateRange={dateRange} filters={filters} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="employees" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Top Performers</CardTitle>
                <CardDescription>
                  Employees with the highest points this month
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <TopEmployeesChart dateRange={dateRange} />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Employee Leaderboard</CardTitle>
                <CardDescription>
                  Sorted by points earned during selected period
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <EmployeeLeaderboard dateRange={dateRange} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="tasks" className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Task Completion Trends</CardTitle>
              <CardDescription>
                Tasks completed over time
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2 h-[300px]">
              <PointsTimeChart dateRange={dateRange} filters={filters} showTasksInstead />
            </CardContent>
          </Card>
          
          {/* Additional task-specific charts could go here */}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportsPage;
