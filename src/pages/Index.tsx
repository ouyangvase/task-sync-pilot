
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Index = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    document.title = "TaskSync Pilot";
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-white to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <div className="container max-w-5xl px-4 py-16">
        <div className="flex flex-col items-center text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-brand-600">
              TaskSync Pilot
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl">
              A simple AI-powered task management system for employee daily task tracking
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <Button size="lg" onClick={() => navigate("/login")}>
              Get Started
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/login")}>
              Learn More
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-border/50">
              <h3 className="text-xl font-semibold mb-3">Daily Task Management</h3>
              <p className="text-muted-foreground">
                Automatically generate recurring daily tasks and track completion status.
              </p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-border/50">
              <h3 className="text-xl font-semibold mb-3">Task Assignments</h3>
              <p className="text-muted-foreground">
                Easily assign one-time or recurring tasks to individuals or teams.
              </p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-border/50">
              <h3 className="text-xl font-semibold mb-3">Progress Tracking</h3>
              <p className="text-muted-foreground">
                Monitor task completion with visual progress indicators and analytics.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
