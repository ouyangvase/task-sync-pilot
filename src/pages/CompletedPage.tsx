
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTasks } from "@/contexts/TaskContext";
import { Task } from "@/types";
import TasksTable from "@/components/completed/TasksTable";
import TaskFilters from "@/components/completed/TaskFilters";
import { toast } from "sonner";
import { mockUsers } from "@/data/mockData";

interface FilterOptions {
  employeeId: string;
  search: string;
  dateFrom: string;
  dateTo: string;
  minPoints: string;
  maxPoints: string;
}

const CompletedPage = () => {
  const { currentUser } = useAuth();
  const { tasks } = useTasks();
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const isAdmin = currentUser?.role === "admin";
  
  useEffect(() => {
    document.title = "Completed Tasks | TaskSync Pilot";
    
    // Initially filter tasks based on user role
    const completedTasks = tasks.filter(task => 
      task.status === "completed" && 
      (isAdmin || task.assignee === currentUser?.id)
    );
    
    setFilteredTasks(completedTasks);
  }, [tasks, currentUser, isAdmin]);

  const handleFilterChange = (filters: FilterOptions) => {
    const { employeeId, search, dateFrom, dateTo, minPoints, maxPoints } = filters;
    
    const filteredResults = tasks.filter(task => {
      // Base condition: always filter for completed tasks
      if (task.status !== "completed") return false;
      
      // For non-admin users, only show their own tasks
      if (!isAdmin && task.assignee !== currentUser?.id) return false;
      
      // Filter by employee (admin only)
      if (isAdmin && employeeId && task.assignee !== employeeId) return false;
      
      // Filter by search term (task title)
      if (search && !task.title.toLowerCase().includes(search.toLowerCase())) return false;
      
      // Filter by completion date range
      if (dateFrom && task.completedAt && new Date(task.completedAt) < new Date(dateFrom)) return false;
      if (dateTo && task.completedAt && new Date(task.completedAt) > new Date(`${dateTo}T23:59:59`)) return false;
      
      // Filter by points range
      if (minPoints && task.points < parseInt(minPoints)) return false;
      if (maxPoints && task.points > parseInt(maxPoints)) return false;
      
      // If all filters pass, include the task
      return true;
    });
    
    setFilteredTasks(filteredResults);
  };

  const handleExportCSV = () => {
    if (filteredTasks.length === 0) {
      toast.error("No tasks to export");
      return;
    }
    
    try {
      // Generate CSV header
      let csvContent = "Task Title,Completion Date,Points,Completed By\n";
      
      // Add data rows
      filteredTasks.forEach(task => {
        const user = mockUsers.find(u => u.id === task.assignee);
        const completedDate = task.completedAt ? new Date(task.completedAt).toLocaleString() : "Not completed";
        const userName = user ? user.name : "Unknown User";
        
        // Escape fields that might contain commas
        const escapeCsvField = (field: string) => {
          if (field.includes(',') || field.includes('"') || field.includes('\n')) {
            return `"${field.replace(/"/g, '""')}"`;
          }
          return field;
        };
        
        csvContent += `${escapeCsvField(task.title)},${completedDate},${task.points},${escapeCsvField(userName)}\n`;
      });
      
      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', 'completed_tasks.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("CSV exported successfully");
    } catch (error) {
      console.error("Error exporting CSV:", error);
      toast.error("Failed to export CSV");
    }
  };

  const handleExportPDF = () => {
    toast.info("PDF export functionality will be implemented soon");
    // In a real implementation, this would use a library like pdfmake or jspdf
    // to generate a PDF document with the filtered tasks
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Completed Tasks Archive</h1>
      </div>
      
      <TaskFilters 
        users={mockUsers}
        onFilterChange={handleFilterChange}
        isAdmin={isAdmin}
      />
      
      <TasksTable 
        tasks={filteredTasks}
        users={mockUsers}
        onExportCSV={handleExportCSV}
        onExportPDF={handleExportPDF}
      />
    </div>
  );
};

export default CompletedPage;
