import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { Navigate } from "react-router-dom";
import EmployeesList from "@/components/employees/EmployeesList";
import EmployeeDetails from "@/components/employees/EmployeeDetails";
import { User, UserRole } from "@/types";
import { Button } from "@/components/ui/button";
import { UserPlus, ShieldAlert } from "lucide-react";
import AddEmployeeDialog from "@/components/employees/AddEmployeeDialog";
import { toast } from "sonner";
import PendingUsersList from "@/components/admin/PendingUsersList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { rolePermissions } from "@/components/employees/employee-details/role-permissions/constants";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

const EmployeesPage = () => {
  const { currentUser, users, getAccessibleUsers, getPendingUsers } = useAuth();
  const [selectedEmployee, setSelectedEmployee] = useState<User | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState("employees");
  const [redirectToLogin, setRedirectToLogin] = useState(false);

  const userRole = currentUser?.role || "employee";
  const userPermissions = rolePermissions[userRole] || [];
  const canViewEmployees = userPermissions.includes("view_employees");
  const canManageUsers = userRole === "admin"; // Only admins can manage users

  const handleEmployeeSelect = (employee: User) => {
    setSelectedEmployee(employee);
  };

  const handleAddEmployee = () => {
    if (!canManageUsers) {
      toast.error("Only administrators can add new employees");
      return;
    }
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
    if (currentUser && userRole === "admin") {
      const pendingUsersData = getPendingUsers();
      console.log("Fetched pending users:", pendingUsersData);
      setPendingUsers(pendingUsersData);
    }
  };

  useEffect(() => {
    if (!currentUser) {
      setRedirectToLogin(true);
      return;
    }
    if (userRole === "admin") {
      handleRefreshPendingUsers();
    } else if (!canViewEmployees) {
      toast.error("You don't have permission to access this page");
      setRedirectToLogin(true);
    }
  }, [currentUser, users, canViewEmployees]);

  let employees: User[] = [];
  if (currentUser) {
    if (userRole === "admin") {
      employees = users.filter(user => 
        user.id !== currentUser.id && user.role !== "admin"
      );
    } else {
      employees = getAccessibleUsers(currentUser.id);
    }
  }

  document.title = "Employee Management | TaskSync Pilot";

  if (redirectToLogin) {
    return <Navigate to="/dashboard" />;
  }

  const showAccessWarning = currentUser && userRole !== "admin";

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

      {showAccessWarning && (
        <Alert>
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Limited Access Mode</AlertTitle>
          <AlertDescription>
            You have limited access to employee management features. Only administrators can change user roles and permissions.
          </AlertDescription>
        </Alert>
      )}

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
