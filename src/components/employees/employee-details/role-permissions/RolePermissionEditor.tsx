
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, UserRole } from "@/types";
import { toast } from "sonner";
import { Shield, Loader2 } from "lucide-react";
import { RolePermissionEditorProps } from "./types";
import { availableRoles, availablePermissions, rolePermissions } from "./constants";
import { PermissionsList } from "./PermissionsList";
import { ConfirmRoleDialog } from "./ConfirmRoleDialog";
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

  // Subscribe to role changes
  useEffect(() => {
    const channel = supabase
      .channel('role-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${employee.id}`
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

  const confirmSave = async () => {
    if (selectedRole === initialRole) {
      toast.info("No changes to save");
      setIsConfirmDialogOpen(false);
      setIsEditing(false);
      return;
    }
    
    setIsSaving(true);
    try {
      // Update role in database
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
      
      // Update local state
      onUpdateRole(employee.id, selectedRole);
      
      setIsEditing(false);
      setIsConfirmDialogOpen(false);
      toast.success(`Role successfully updated to ${selectedRole}`);
    } catch (error) {
      console.error("Error saving role:", error);
      toast.error(`Failed to update role: ${error instanceof Error ? error.message : String(error)}`);
      // Revert local state on error
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
                setSelectedRole(initialRole);
                setSelectedPermissions(rolePermissions[initialRole] || []);
                setIsEditing(false);
              }}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
              variant="default"
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
                    {availableRoles.map(role => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name}
                      </SelectItem>
                    ))}
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
