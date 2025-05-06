import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";
import { User, UserRole } from "@/types";
import { toast } from "sonner";
import { RolePermissionEditorProps } from "./types";
import { availablePermissions, rolePermissions } from "./constants";
import { PermissionsList } from "./PermissionsList";
import { ConfirmRoleDialog } from "./ConfirmRoleDialog";
import { RoleSelector } from "./RoleSelector";
import { RoleEditorActions } from "./RoleEditorActions";
import { supabase } from "@/integrations/supabase/client";
import { DbRole, mapAppRoleToDbRole, mapDbRoleToAppRole } from "@/utils/roleUtils";

export function RolePermissionEditor({ employee, isAdmin, onUpdateRole }: RolePermissionEditorProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole>(employee.role as UserRole);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(
    rolePermissions[employee.role] || []
  );
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [initialRole] = useState<UserRole>(employee.role as UserRole);

  // Calculate whether changes have been made
  const hasChanges = selectedRole !== initialRole || 
    JSON.stringify(selectedPermissions) !== JSON.stringify(rolePermissions[initialRole]);

  // Subscribe to role changes - use the user_roles table instead of profiles
  useEffect(() => {
    const channel = supabase
      .channel('role-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_roles',
          filter: `user_id=eq.${employee.id}`
        },
        (payload) => {
          console.log('Role updated from user_roles table:', payload);
          if (payload.new && payload.new.role) {
            // Map database role to application role
            const appRole = mapDbRoleToAppRole(payload.new.role as DbRole);
            if (appRole !== selectedRole) {
              setSelectedRole(appRole);
              setSelectedPermissions(rolePermissions[appRole] || []);
              toast.success(`Role updated to ${appRole}`);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [employee.id, selectedRole]);

  // Initialize role and permissions when employee data changes
  useEffect(() => {
    setSelectedRole(employee.role as UserRole);
    setSelectedPermissions(rolePermissions[employee.role] || []);
  }, [employee.role]);

  if (!isAdmin) return null;

  const handleRoleChange = (role: string) => {
    setSelectedRole(role as UserRole);
    setSelectedPermissions(rolePermissions[role] || []);
  };

  const handleSave = () => {
    if (!isAdmin) {
      toast.error("Only administrators can modify roles");
      return;
    }
    setIsConfirmDialogOpen(true);
  };

  const handleCancel = () => {
    setSelectedRole(initialRole);
    setSelectedPermissions(rolePermissions[initialRole] || []);
    setIsEditing(false);
  };

  const confirmSave = async () => {
    if (selectedRole === initialRole) {
      toast.info("No changes to save");
      setIsConfirmDialogOpen(false);
      setIsEditing(false);
      return;
    }
    
    setIsSaving(true);
    try {
      // Update both the profiles table and user_roles table
      
      // 1. Update the profiles table for backward compatibility
      const { error: profileUpdateError } = await supabase
        .from('profiles')
        .update({ 
          role: selectedRole,
          updated_at: new Date().toISOString()
        })
        .eq('id', employee.id);
        
      if (profileUpdateError) {
        throw profileUpdateError;
      }
      
      // 2. Handle the user_roles table - first delete existing roles
      const { error: deleteError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', employee.id);
      
      if (deleteError) {
        console.error("Error deleting existing user role:", deleteError);
      }
      
      // 3. Insert the new role - map to the database enum
      const dbRole = mapAppRoleToDbRole(selectedRole);
      const { error: insertError } = await supabase
        .from('user_roles')
        .insert({
          user_id: employee.id,
          role: dbRole as any // Use as any to bypass type checking temporarily
        });
      
      if (insertError) {
        throw insertError;
      }
      
      onUpdateRole(employee.id, selectedRole);
      
      setIsEditing(false);
      setIsConfirmDialogOpen(false);
      toast.success(`Role successfully updated to ${selectedRole}`);
    } catch (error) {
      console.error("Error saving role:", error);
      
      // Extract error message properly
      let errorMessage = "Unknown error occurred";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null) {
        // Handle Supabase error objects which may have a message or details property
        errorMessage = (error as any).message || (error as any).details || JSON.stringify(error);
      } else {
        errorMessage = String(error);
      }
      
      toast.error(`Failed to update role: ${errorMessage}`);
      setSelectedRole(initialRole);
      setSelectedPermissions(rolePermissions[initialRole] || []);
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
        <RoleEditorActions 
          isEditing={isEditing}
          isSaving={isSaving}
          hasChanges={hasChanges}
          onEdit={() => setIsEditing(true)}
          onCancel={handleCancel}
          onSave={handleSave}
        />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="font-medium mb-2">Current Role</p>
            <div className="flex items-center">
              <RoleSelector 
                selectedRole={selectedRole}
                isEditing={isEditing}
                onRoleChange={handleRoleChange}
              />
            </div>
          </div>

          <div>
            <p className="font-medium mb-2">Permissions</p>
            <PermissionsList 
              permissions={availablePermissions}
              selectedPermissions={selectedPermissions}
              onTogglePermission={() => {}}
              isEditing={false}
              rolePermissions={rolePermissions}
              employeeRole={selectedRole}
            />
          </div>
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
