
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import EmployeesList from "@/components/employees/EmployeesList";
import EmployeeDetails from "@/components/employees/EmployeeDetails";
import { User } from "@/types";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import AddEmployeeDialog from "@/components/employees/AddEmployeeDialog";
import { toast } from "sonner";

const EmployeesPage = () => {
  const { currentUser, users } = useAuth();
  const [selectedEmployee, setSelectedEmployee] = useState<User | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Redirect non-admin users away from this page
  if (currentUser?.role !== "admin") {
    return <Navigate to="/dashboard" />;
  }

  const employees = users.filter(user => user.role === "employee");
  
  const handleEmployeeSelect = (employee: User) => {
    setSelectedEmployee(employee);
  };

  const handleAddEmployee = () => {
    setIsAddDialogOpen(true);
  };

  const handleCloseAddDialog = () => {
    setIsAddDialogOpen(false);
  };

  const handleEmployeeCreated = () => {
    toast.success("Employee added successfully");
    setIsAddDialogOpen(false);
  };

  document.title = "Employee Management | TaskSync Pilot";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Employee Management</h1>
        <Button onClick={handleAddEmployee}>
          <UserPlus className="mr-2 h-4 w-4" />
          Add Employee
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <EmployeesList 
            employees={employees} 
            onSelectEmployee={handleEmployeeSelect} 
            selectedEmployee={selectedEmployee}
          />
        </div>
        <div className="lg:col-span-2">
          {selectedEmployee ? (
            <EmployeeDetails employee={selectedEmployee} />
          ) : (
            <div className="rounded-lg border border-border bg-card p-8 text-center">
              <p className="text-muted-foreground">Select an employee to view their details</p>
            </div>
          )}
        </div>
      </div>

      <AddEmployeeDialog 
        open={isAddDialogOpen} 
        onClose={handleCloseAddDialog} 
        onEmployeeCreated={handleEmployeeCreated}
      />
    </div>
  );
};

export default EmployeesPage;
