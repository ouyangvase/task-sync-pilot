
import { useAuth } from "@/contexts/AuthContext";
import { useTasks } from "@/contexts/TaskContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { uniqueCategories } from "@/lib/taskUtils";

interface ReportFiltersProps {
  filters: {
    employee: string;
    category: string;
    status: string;
  };
  setFilters: React.Dispatch<
    React.SetStateAction<{
      employee: string;
      category: string;
      status: string;
    }>
  >;
}

export function ReportFilters({ filters, setFilters }: ReportFiltersProps) {
  const { users } = useAuth();
  const { tasks } = useTasks();
  
  // Include all users except admins (employees, team leads, and managers)
  const nonAdminUsers = users.filter(user => user.role !== "admin");
  const categories = uniqueCategories(tasks);
  
  return (
    <Card>
      <CardContent className="pt-6 px-6 pb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="employee-filter">Filter by User</Label>
            <Select 
              value={filters.employee} 
              onValueChange={(value) => setFilters(prev => ({ ...prev, employee: value }))}
            >
              <SelectTrigger id="employee-filter">
                <SelectValue placeholder="All Users" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                {nonAdminUsers.map(user => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name} ({user.role})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category-filter">Filter by Category</Label>
            <Select 
              value={filters.category} 
              onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}
            >
              <SelectTrigger id="category-filter">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="status-filter">Filter by Status</Label>
            <Select 
              value={filters.status} 
              onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
            >
              <SelectTrigger id="status-filter">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
