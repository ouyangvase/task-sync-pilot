
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Shield, ShieldAlert } from "lucide-react";
import { Separator } from "@/components/ui/separator";

// Define permission types
type Permission = {
  id: string;
  name: string;
  description: string;
};

type Role = {
  id: string;
  name: string;
  description: string;
};

type RolePermission = {
  roleId: string;
  permissionId: string;
  enabled: boolean;
};

const RolesSettingsPage = () => {
  const { currentUser } = useAuth();
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Check if user is admin
  const isAdmin = currentUser?.role === "admin";

  useEffect(() => {
    if (!isAdmin) return;
    
    // Load roles and permissions data
    // In a real app, this would come from an API
    const loadData = async () => {
      try {
        setLoading(true);
        // Mock data for demonstration
        const mockRoles: Role[] = [
          { id: "employee", name: "Employee", description: "Regular employee with limited access" },
          { id: "team_lead", name: "Team Lead", description: "Team leaders with additional team management capabilities" },
          { id: "manager", name: "Manager", description: "Department managers with reporting access" },
          { id: "admin", name: "Admin", description: "System administrators with full access" }
        ];
        
        const mockPermissions: Permission[] = [
          { id: "view_tasks", name: "View Tasks", description: "Can view all tasks in the system" },
          { id: "edit_own_tasks", name: "Edit Own Tasks", description: "Can edit tasks assigned to them" },
          { id: "edit_all_tasks", name: "Edit All Tasks", description: "Can edit any task in the system" },
          { id: "assign_tasks", name: "Assign Tasks", description: "Can assign tasks to other users" },
          { id: "access_reports", name: "Access Reports", description: "Can view and generate reports" },
          { id: "manage_users", name: "Manage Users", description: "Can add, edit, and delete users" },
          { id: "upload_achievements", name: "Upload Achievements", description: "Can create and manage achievements" }
        ];
        
        // Initialize role permissions (in a real app, this would come from database)
        const initialRolePermissions: RolePermission[] = [];
        
        mockRoles.forEach(role => {
          mockPermissions.forEach(permission => {
            // Default permissions setup
            let enabled = false;
            
            // Employee can view tasks and edit their own
            if (role.id === "employee" && 
                (permission.id === "view_tasks" || permission.id === "edit_own_tasks")) {
              enabled = true;
            }
            
            // Team lead can also assign tasks
            if (role.id === "team_lead" && 
                (permission.id === "view_tasks" || permission.id === "edit_own_tasks" || 
                 permission.id === "assign_tasks")) {
              enabled = true;
            }
            
            // Manager can do all except manage users
            if (role.id === "manager" && permission.id !== "manage_users") {
              enabled = true;
            }
            
            // Admin can do everything
            if (role.id === "admin") {
              enabled = true;
            }
            
            initialRolePermissions.push({
              roleId: role.id,
              permissionId: permission.id,
              enabled
            });
          });
        });
        
        setRoles(mockRoles);
        setPermissions(mockPermissions);
        setRolePermissions(initialRolePermissions);
      } catch (error) {
        console.error("Error loading roles and permissions:", error);
        toast.error("Failed to load roles and permissions");
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [isAdmin]);

  // If user is not admin, redirect to dashboard
  if (!isAdmin) {
    toast.error("You don't have permission to access this page");
    return <Navigate to="/dashboard" replace />;
  }

  const handlePermissionToggle = (roleId: string, permissionId: string) => {
    setRolePermissions(prev => {
      const updated = prev.map(rp => {
        if (rp.roleId === roleId && rp.permissionId === permissionId) {
          return { ...rp, enabled: !rp.enabled };
        }
        return rp;
      });
      setHasChanges(true);
      return updated;
    });
  };

  const isPermissionEnabled = (roleId: string, permissionId: string): boolean => {
    const rolePermission = rolePermissions.find(
      rp => rp.roleId === roleId && rp.permissionId === permissionId
    );
    return rolePermission?.enabled || false;
  };

  const handleSaveChanges = async () => {
    try {
      setSaving(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, save changes to database here
      
      toast.success("Role permissions updated successfully");
      setHasChanges(false);
    } catch (error) {
      console.error("Error saving permissions:", error);
      toast.error("Failed to update role permissions");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center gap-2 mb-6">
        <Shield className="h-6 w-6 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight">Role Permissions</h1>
      </div>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-amber-500" />
            Role-Based Access Control
          </CardTitle>
          <CardDescription>
            Manage which permissions are granted to each role in the system.
            Changes made here will affect all users with the corresponding role.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[150px]">Permission</TableHead>
                  <TableHead className="w-[250px]">Description</TableHead>
                  {roles.map(role => (
                    <TableHead key={role.id} className="text-center">
                      {role.name}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {permissions.map(permission => (
                  <TableRow key={permission.id}>
                    <TableCell className="font-medium">{permission.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {permission.description}
                    </TableCell>
                    {roles.map(role => (
                      <TableCell key={`${role.id}-${permission.id}`} className="text-center">
                        <Switch
                          checked={isPermissionEnabled(role.id, permission.id)}
                          onCheckedChange={() => handlePermissionToggle(role.id, permission.id)}
                          disabled={role.id === "admin" && permission.id === "manage_users"}
                          aria-label={`${permission.name} for ${role.name}`}
                        />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          <div className="mt-8 flex justify-end">
            <Button 
              variant="default" 
              onClick={handleSaveChanges} 
              disabled={!hasChanges || saving}
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Separator className="my-8" />
      
      <Card>
        <CardHeader>
          <CardTitle>Role Descriptions</CardTitle>
          <CardDescription>
            Overview of the different roles in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.map(role => (
                <TableRow key={role.id}>
                  <TableCell className="font-medium">{role.name}</TableCell>
                  <TableCell>{role.description}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default RolesSettingsPage;
