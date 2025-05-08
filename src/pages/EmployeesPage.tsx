import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { Navigate } from "react-router-dom";
import EmployeesList from "@/components/employees/EmployeesList";
import EmployeeDetails from "@/components/employees/EmployeeDetails";
import { User, UserRole } from "@/types";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import AddEmployeeDialog from "@/components/employees/AddEmployeeDialog";
import { toast } from "sonner";
import PendingUsersList from "@/components/admin/PendingUsersList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const EmployeesPage = () => {
  const { currentUser, users, getAccessibleUsers, getPendingUsers } = useAuth();
  const [selectedEmployee, setSelectedEmployee] = useState<User | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState("employees");
  const [redirectToLogin, setRedirectToLogin] = useState(false);

  // Get only the employees the current user can access based on permissions
  const accessibleUsers = currentUser ? getAccessibleUsers(currentUser.id) : [];
  const employees = accessibleUsers.filter(user => user.role === "employee");
  
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

  const handleRefreshPendingUsers = () => {
    if (currentUser) {
      setPendingUsers(getPendingUsers());
    }
  };

  // Load pending users on mount and when current user changes
  useEffect(() => {
    if (currentUser?.role === "admin") {
      handleRefreshPendingUsers();
    } else if (currentUser) {
      const allowedRoles: UserRole[] = ["admin", "manager", "team_lead"];
      if (!allowedRoles.includes(currentUser.role as UserRole)) {
        toast.error("You don't have permission to access this page");
        setRedirectToLogin(true);
      }
    }
  }, [currentUser]);

  document.title = "Employee Management | TaskSync Pilot";

  // Redirect non-admin and non-manager users away from this page
  if (redirectToLogin) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Employee Management</h1>
        {currentUser?.role === "admin" && (
          <Button onClick={handleAddEmployee}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Employee
          </Button>
        )}
      </div>

      {currentUser?.role === "admin" && (
        <Tabs defaultValue="employees" value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="employees">Employees</TabsTrigger>
            <TabsTrigger value="pending">
              Pending Approvals
              {pendingUsers.length > 0 && (
                <span className="ml-2 bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
                  {pendingUsers.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="employees" className="mt-6">
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
          </TabsContent>
          <TabsContent value="pending" className="mt-6">
            <PendingUsersList 
              pendingUsers={pendingUsers} 
              onRefresh={handleRefreshPendingUsers} 
            />
          </TabsContent>
        </Tabs>
      )}

      {currentUser?.role !== "admin" && (
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
      )}

      <AddEmployeeDialog 
        open={isAddDialogOpen} 
        onClose={handleCloseAddDialog} 
        onEmployeeCreated={handleEmployeeCreated}
      />
    </div>
  );
};

export default EmployeesPage;
