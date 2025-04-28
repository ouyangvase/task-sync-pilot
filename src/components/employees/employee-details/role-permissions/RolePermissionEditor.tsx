
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
          console.log('Role updated:', payload);
          if (payload.new && payload.new.role !== selectedRole) {
            setSelectedRole(payload.new.role as UserRole);
            setSelectedPermissions(rolePermissions[payload.new.role] || []);
            toast.success(`Role updated to ${payload.new.role}`);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [employee.id]);

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
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          role: selectedRole,
          updated_at: new Date().toISOString()
        })
        .eq('id', employee.id);
        
      if (updateError) {
        throw updateError;
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
