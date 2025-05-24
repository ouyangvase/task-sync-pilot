
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "@/types";
import { useTasks } from "@/contexts/task";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Award, Shield, Users, Crown } from "lucide-react";

interface EmployeesListProps {
  employees: User[];
  onSelectEmployee: (employee: User) => void;
  selectedEmployee: User | null;
}

const EmployeesList = ({ employees, onSelectEmployee, selectedEmployee }: EmployeesListProps) => {
  const { getUserTaskStats, getUserPointsStats } = useTasks();

  // Helper function to get role icon
  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Crown className="h-3 w-3 text-yellow-500" />;
      case "manager":
        return <Shield className="h-3 w-3 text-blue-500" />;
      case "team_lead":
        return <Users className="h-3 w-3 text-green-500" />;
      default:
        return <Award className="h-3 w-3 text-gray-500" />;
    }
  };

  // Helper function to get role color
  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "text-yellow-600 bg-yellow-50";
      case "manager":
        return "text-blue-600 bg-blue-50";
      case "team_lead":
        return "text-green-600 bg-green-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  if (employees.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No users found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Users</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ul className="divide-y divide-border">
          {employees.map((employee) => {
            const taskStats = getUserTaskStats(employee.id);
            const pointsStats = getUserPointsStats(employee.id);
            
            return (
              <li 
                key={employee.id}
                onClick={() => onSelectEmployee(employee)}
                className={`p-4 cursor-pointer hover:bg-accent/50 transition-colors ${
                  selectedEmployee?.id === employee.id ? "bg-accent" : ""
                }`}
              >
                <div className="flex items-center space-x-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={employee.avatar} alt={employee.name} />
                    <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium truncate">{employee.name}</p>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${getRoleColor(employee.role)}`}>
                        {getRoleIcon(employee.role)}
                        {employee.role}
                      </span>
                    </div>
                    {employee.title && (
                      <p className="text-xs flex items-center gap-1 text-muted-foreground">
                        <Award className="h-3 w-3" />
                        {employee.title}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground truncate">{employee.email}</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                      {pointsStats.earned} pts
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {taskStats.percentComplete}% complete
                    </span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
};

export default EmployeesList;
