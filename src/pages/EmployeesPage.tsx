
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
import { rolePermissions } from "@/components/employees/employee-details/role-permissions/constants";

const EmployeesPage = () => {
  const { currentUser, users, getAccessibleUsers, getPendingUsers } = useAuth();
  const [selectedEmployee, setSelectedEmployee] = useState<User | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState("employees");
  const [redirectToLogin, setRedirectToLogin] = useState(false);

  // Debug users
  useEffect(() => {
    console.log("All users in EmployeesPage:", users);
  }, [users]);

  // Check if the user has permission to access this page
  const userRole = currentUser?.role || "employee";
  const userPermissions = rolePermissions[userRole] || [];
  const canViewEmployees = userPermissions.includes("view_employees");
  const canManageUsers = userPermissions.includes("manage_users");

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
    if (currentUser && canManageUsers) {
      const pendingUsersData = getPendingUsers();
      setPendingUsers(pendingUsersData);
      console.log("Pending users refreshed:", pendingUsersData);
    }
  };

  // Load pending users and check permissions
  useEffect(() => {
    if (!currentUser) {
      console.log("No current user, redirecting to login");
      setRedirectToLogin(true);
      return;
    }
    
    console.log("Current user role:", currentUser.role);
    
    if (currentUser.role === "admin") {
      console.log("Admin user, loading pending users");
      handleRefreshPendingUsers();
    } else if (!canViewEmployees) {
      console.log("User doesn't have permission to view employees");
      toast.error("You don't have permission to access this page");
      setRedirectToLogin(true);
    }
  }, [currentUser, users, canViewEmployees]);

  // Get only the employees the current user can access based on permissions
  const accessibleUsers = currentUser ? getAccessibleUsers(currentUser.id) : [];
  console.log("Accessible users:", accessibleUsers);
  
  // Filter employees based on role
  const employees = accessibleUsers.filter(user => {
    if (!user) return false;
    
    // Admin can see all users
    if (userRole === "admin") {
      return ["employee", "team_lead", "manager"].includes(user.role);
    }
    
    // Manager can see team leads and employees
    if (userRole === "manager") {
      return ["employee", "team_lead"].includes(user.role);
    }
    
    // Team lead can only see employees
    if (userRole === "team_lead") {
      return user.role === "employee";
    }
    
    return false;
  });
  
  console.log("Filtered employees to display:", employees);

  document.title = "Employee Management | TaskSync Pilot";

  // Redirect users without required permission away from this page
  if (redirectToLogin) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Employee Management</h1>
        {canManageUsers && (
          <Button onClick={handleAddEmployee}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Employee
          </Button>
        )}
      </div>

      {userRole === "admin" && (
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

      {userRole !== "admin" && (
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

      {canManageUsers && (
        <AddEmployeeDialog 
          open={isAddDialogOpen} 
          onClose={handleCloseAddDialog} 
          onEmployeeCreated={handleEmployeeCreated}
        />
      )}
    </div>
  );
};

export default EmployeesPage;
