
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, UserRole } from "@/types";
import { toast } from "sonner";
import { Shield, Loader2, AlertTriangle } from "lucide-react";
import { RolePermissionEditorProps } from "./types";
import { availableRoles, availablePermissions, rolePermissions } from "./constants";
import { PermissionsList } from "./PermissionsList";
import { ConfirmRoleDialog } from "./ConfirmRoleDialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";

export function RolePermissionEditor({ employee, isAdmin, onUpdateRole }: RolePermissionEditorProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole>(employee.role as UserRole);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(
    rolePermissions[employee.role] || []
  );
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [initialRole] = useState<UserRole>(employee.role as UserRole);
  const { currentUser } = useAuth();

  // Initialize role and permissions when employee data changes
  useEffect(() => {
    setSelectedRole(employee.role as UserRole);
    setSelectedPermissions(rolePermissions[employee.role] || []);
  }, [employee.role]);

  // Check if current user is an admin - this is crucial for security
  const canManageRoles = currentUser?.role === "admin";

  // If not an admin, don't render the role editor
  if (!isAdmin || !canManageRoles) return null;

  const handleRoleChange = (role: string) => {
    setSelectedRole(role as UserRole);
    // When role changes, automatically update permissions to match the default for that role
    setSelectedPermissions(rolePermissions[role] || []);
  };

  const handlePermissionToggle = (permissionId: string) => {
    setSelectedPermissions(prev => {
      if (prev.includes(permissionId)) {
        return prev.filter(id => id !== permissionId);
      } else {
        return [...prev, permissionId];
      }
    });
  };

  const handleSave = () => {
    // Extra validation before opening confirmation dialog
    if (!canManageRoles) {
      toast.error("Only administrators can change user roles");
      return;
    }
    
    // Prevent changing roles to admin for security reasons
    if (selectedRole === "admin" && employee.role !== "admin") {
      toast.error("Cannot promote users to admin role through this interface");
      return;
    }
    
    setIsConfirmDialogOpen(true);
  };

  const confirmSave = async () => {
    if (selectedRole === initialRole) {
      toast.info("No changes to save");
      setIsConfirmDialogOpen(false);
      setIsEditing(false);
      return;
    }
    
    // Additional security check before proceeding
    if (!canManageRoles) {
      toast.error("Permission denied: Only administrators can change user roles");
      setIsConfirmDialogOpen(false);
      return;
    }
    
    setIsSaving(true);
    try {
      // Log the role change attempt for audit purposes
      console.log(`Admin ${currentUser?.name} (${currentUser?.id}) attempting to change ${employee.name}'s role from ${employee.role} to ${selectedRole}`);
      
      // Update role in local state
      onUpdateRole(employee.id, selectedRole);
      
      // If user has a Supabase ID (not a local mock), update in database
      if (employee.id && !employee.id.includes('user_')) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ 
            role: selectedRole,
            updated_at: new Date().toISOString()
          })
          .eq('id', employee.id);
          
        if (profileError) {
          console.error("Error updating role in Supabase:", profileError);
          toast.error("Failed to update role: " + profileError.message);
          // Revert local state if database update failed
          onUpdateRole(employee.id, initialRole);
          return;
        }
        
        // Create an audit log entry for the role change
        try {
          const { error: auditError } = await supabase
            .from('audit_logs')
            .insert({
              user_id: currentUser?.id,
              action: 'role_change',
              target_user_id: employee.id,
              details: JSON.stringify({
                oldRole: employee.role,
                newRole: selectedRole
              })
            });
            
          if (auditError) {
            console.error("Error logging role change:", auditError);
            // Non-critical error, don't stop the process
          }
        } catch (auditErr) {
          // If the audit_logs table doesn't exist yet, just log to console
          console.log("Could not create audit log (table may not exist)");
        }
        
        toast.success(`Role updated to ${selectedRole}`);
      } else {
        toast.success(`Role updated to ${selectedRole} (local only)`);
      }

      setIsEditing(false);
      setIsConfirmDialogOpen(false);
    } catch (error) {
      console.error("Error saving role:", error);
      toast.error(`Failed to update role: ${error instanceof Error ? error.message : String(error)}`);
      // Revert local state on error
      onUpdateRole(employee.id, initialRole);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Role & Permissions
          </CardTitle>
          <CardDescription>
            Manage employee access level and permissions
          </CardDescription>
        </div>
        {!isEditing ? (
          <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
            Edit Access
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                setSelectedRole(employee.role as UserRole);
                setSelectedPermissions(rolePermissions[employee.role] || []);
                setIsEditing(false);
              }}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button 
              size="sm" 
              onClick={handleSave} 
              disabled={isSaving || selectedRole === initialRole}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="font-medium mb-2">Current Role</p>
            <div className="flex items-center">
              {isEditing ? (
                <Select value={selectedRole} onValueChange={handleRoleChange}>
                  <SelectTrigger className="w-[240px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRoles
                      // Filter out admin role from selectable options for security
                      .filter(role => role.id !== "admin" || employee.role === "admin")
                      .map(role => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.name}
                        </SelectItem>
                      ))
                    }
                  </SelectContent>
                </Select>
              ) : (
                <div className="bg-muted/50 py-2 px-3 rounded-md capitalize">
                  {employee.role}
                </div>
              )}
            </div>
          </div>

          <div>
            <p className="font-medium mb-2">Permissions</p>
            <PermissionsList 
              permissions={availablePermissions}
              selectedPermissions={selectedPermissions}
              onTogglePermission={handlePermissionToggle}
              isEditing={isEditing}
              rolePermissions={rolePermissions}
              employeeRole={selectedRole}
            />
          </div>

          {/* Warning notice for non-admin users */}
          {!canManageRoles && (
            <div className="mt-4 p-3 bg-amber-100 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700 rounded-md flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <p className="text-sm text-amber-700 dark:text-amber-400">
                Only administrators can change user roles
              </p>
            </div>
          )}
        </div>
      </CardContent>

      <ConfirmRoleDialog
        isOpen={isConfirmDialogOpen}
        onClose={() => setIsConfirmDialogOpen(false)}
        onConfirm={confirmSave}
        employee={employee}
        selectedRole={selectedRole}
        isSaving={isSaving}
      />
    </Card>
  );
}
