
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
import { useScreenSize } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

const EmployeesPage = () => {
  const { currentUser, users, getAccessibleUsers } = useAuth();
  const [selectedEmployee, setSelectedEmployee] = useState<User | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [redirectToLogin, setRedirectToLogin] = useState(false);
  const [showEmployeeList, setShowEmployeeList] = useState(true);
  const { isMobile } = useScreenSize();

  // Get all users the current user can access based on permissions
  const accessibleUsers = currentUser ? getAccessibleUsers(currentUser.id) : [];
  
  // For admins, show all approved users. For others, filter based on their permissions
  const displayUsers = currentUser?.role === "admin" 
    ? accessibleUsers.filter(user => user.isApproved !== false)
    : accessibleUsers;
  
  const handleEmployeeSelect = (employee: User) => {
    setSelectedEmployee(employee);
    if (isMobile) {
      setShowEmployeeList(false);
    }
  };

  const handleBackToList = () => {
    setShowEmployeeList(true);
    setSelectedEmployee(null);
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

  const handleUserDeleted = () => {
    // Clear the selected employee if they were deleted
    setSelectedEmployee(null);
    if (isMobile) {
      setShowEmployeeList(true);
    }
  };

  // Check permissions on mount
  useEffect(() => {
    if (currentUser) {
      const allowedRoles: UserRole[] = ["admin", "manager", "team_lead"];
      if (!allowedRoles.includes(currentUser.role as UserRole)) {
        toast.error("You don't have permission to access this page");
        setRedirectToLogin(true);
      }
    }
  }, [currentUser]);

  // Clear selected employee if they're no longer in the list (e.g., after deletion)
  useEffect(() => {
    if (selectedEmployee && !displayUsers.find(user => user.id === selectedEmployee.id)) {
      setSelectedEmployee(null);
      if (isMobile) {
        setShowEmployeeList(true);
      }
    }
  }, [displayUsers, selectedEmployee, isMobile]);

  document.title = "User Management | TaskSync Pilot";

  // Redirect non-admin and non-manager users away from this page
  if (redirectToLogin) {
    return <Navigate to="/dashboard" />;
  }

  if (isMobile) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
          {currentUser?.role === "admin" && (
            <Button onClick={handleAddEmployee} size="sm" className="min-h-[44px]">
              <UserPlus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          )}
        </div>

        {/* Mobile: Show either list or details */}
        {showEmployeeList ? (
          <EmployeesList 
            employees={displayUsers} 
            onSelectEmployee={handleEmployeeSelect} 
            selectedEmployee={selectedEmployee}
          />
        ) : (
          <div className="space-y-4">
            <Button 
              variant="outline" 
              onClick={handleBackToList}
              className="min-h-[44px] w-full sm:w-auto"
            >
              ← Back to List
            </Button>
            {selectedEmployee && (
              <EmployeeDetails 
                employee={selectedEmployee} 
                onUserDeleted={handleUserDeleted}
              />
            )}
          </div>
        )}

        <AddEmployeeDialog 
          open={isAddDialogOpen} 
          onClose={handleCloseAddDialog} 
          onEmployeeCreated={handleEmployeeCreated}
        />
      </div>
    );
  }

  // Desktop layout
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        {currentUser?.role === "admin" && (
          <Button onClick={handleAddEmployee}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <EmployeesList 
            employees={displayUsers} 
            onSelectEmployee={handleEmployeeSelect} 
            selectedEmployee={selectedEmployee}
          />
        </div>
        <div className="lg:col-span-2">
          {selectedEmployee ? (
            <EmployeeDetails 
              employee={selectedEmployee} 
              onUserDeleted={handleUserDeleted}
            />
          ) : (
            <div className="rounded-lg border border-border bg-card p-8 text-center">
              <p className="text-muted-foreground">Select a user to view their details</p>
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
