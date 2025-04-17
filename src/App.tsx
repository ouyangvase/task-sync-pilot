
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import { TaskProvider } from "@/contexts/TaskContext";
import AppLayout from "@/components/layout/AppLayout";
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import TasksPage from "@/pages/TasksPage";
import CalendarPage from "@/pages/CalendarPage";
import CompletedPage from "@/pages/CompletedPage";
import EmployeesPage from "@/pages/EmployeesPage";
import ReportsPage from "@/pages/ReportsPage";
import ProfilePage from "@/pages/ProfilePage";
import AchievementsPage from "@/pages/AchievementsPage";
import RolesSettingsPage from "@/pages/RolesSettingsPage";
import NotFoundPage from "@/pages/NotFoundPage";
import EmployeeRegistrationPage from "@/pages/EmployeeRegistrationPage";
import RegistrationPage from "@/pages/RegistrationPage";
import { TooltipProvider } from "@/components/ui/tooltip";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TaskProvider>
        <BrowserRouter>
          <TooltipProvider>
            <Toaster />
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegistrationPage />} />
              <Route path="/register/employee" element={<EmployeeRegistrationPage />} />
              <Route path="/" element={<AppLayout />}>
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="tasks" element={<TasksPage />} />
                <Route path="calendar" element={<CalendarPage />} />
                <Route path="completed" element={<CompletedPage />} />
                <Route path="employees" element={<EmployeesPage />} />
                <Route path="reports" element={<ReportsPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="achievements" element={<AchievementsPage />} />
                <Route path="settings/roles" element={<RolesSettingsPage />} />
                {/* Placeholder routes for future implementation */}
                <Route path="settings" element={<div className="py-10 text-center">Settings coming soon!</div>} />
              </Route>
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </TooltipProvider>
        </BrowserRouter>
      </TaskProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
