
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "@/types";
import { useTasks } from "@/contexts/TaskContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Award } from "lucide-react";
import DeleteUserButton from "./DeleteUserButton";
import { useAuth } from "@/contexts/auth"; // Fix import path

interface EmployeesListProps {
  employees: User[];
  onSelectEmployee: (employee: User) => void;
  selectedEmployee: User | null;
}

const EmployeesList = ({ employees, onSelectEmployee, selectedEmployee }: EmployeesListProps) => {
  const { getUserTaskStats, getUserPointsStats } = useTasks();
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === "admin";

  if (employees.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Employees</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No employees found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Employees</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ul className="divide-y divide-border">
          {employees.map((employee) => {
            const taskStats = getUserTaskStats(employee.id);
            const pointsStats = getUserPointsStats(employee.id);
            
            return (
              <li 
                key={employee.id}
                className="flex flex-col p-4"
              >
                <div 
                  className={`flex items-center space-x-4 cursor-pointer hover:bg-accent/50 transition-colors rounded-md p-2 ${
                    selectedEmployee?.id === employee.id ? "bg-accent" : ""
                  }`}
                  onClick={() => onSelectEmployee(employee)}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={employee.avatar} alt={employee.name} />
                    <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{employee.name}</p>
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
                
                {isAdmin && (
                  <div className="mt-2 flex justify-end">
                    <DeleteUserButton user={employee} />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
};

export default EmployeesList;
