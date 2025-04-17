
import { Button } from "@/components/ui/button";
import { PlusCircle, ShieldOff, Shield } from "lucide-react";
import { User } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { rolePermissions } from "./role-permissions/constants";

interface ActionButtonsProps {
  employee: User;
  onTaskDialogOpen: () => void;
  onPermissionsDialogOpen?: () => void;
  canEdit?: boolean;
}

export function ActionButtons({ 
  employee, 
  onTaskDialogOpen, 
  onPermissionsDialogOpen,
  canEdit = false 
}: ActionButtonsProps) {
  const { currentUser } = useAuth();
  const userRole = currentUser?.role || "employee";
  const userPermissions = rolePermissions[userRole] || [];
  
  // Check if user has permission to assign tasks
  const canAssignTasks = userPermissions.includes("assign_tasks");
  const canManageUsers = userPermissions.includes("manage_users");
  
  // For team leads, they can only assign tasks to their team members
  const isTeamLead = userRole === "team_lead";
  
  // Logic for team lead restrictions - placeholder for team membership check
  // In a real application, you would check if the employee is part of the team lead's team
  const isTeamMember = true; // This would be a real check based on team membership data
  
  const hasAssignPermission = canEdit && (
    !isTeamLead || (isTeamLead && isTeamMember)
  );

  return (
    <div className="flex space-x-2">
      {canAssignTasks && hasAssignPermission && (
        <Button variant="outline" size="sm" onClick={onTaskDialogOpen}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Assign Task
        </Button>
      )}
      
      {canManageUsers && currentUser?.role === "admin" && (
        <Button variant="outline" size="sm" onClick={onPermissionsDialogOpen}>
          <Shield className="h-4 w-4 mr-2" />
          Manage Permissions
        </Button>
      )}
      
      {(!canAssignTasks || !hasAssignPermission) && !canManageUsers && (
        <Button variant="outline" size="sm" disabled title={
          !canAssignTasks 
            ? "You don't have permission to assign tasks" 
            : isTeamLead && !isTeamMember 
              ? "You can only assign tasks to your team members"
              : "You don't have permission to edit this employee"
        }>
          <ShieldOff className="h-4 w-4 mr-2" />
          No Access
        </Button>
      )}
    </div>
  );
}
