import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { User, UserRole } from "@/types";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import PendingUsersEmptyState from "./PendingUsersEmptyState";
import PendingUsersTable from "./PendingUsersTable";
import { mapAppRoleToDbRole } from "@/utils/roleUtils";

interface PendingUsersListProps {
  pendingUsers: User[];
  onRefresh: () => void;
}

const PendingUsersList = ({ pendingUsers, onRefresh }: PendingUsersListProps) => {
  const { approveUser, rejectUser, updateUserRole, updateUserTitle } = useAuth();
  const [processingIds, setProcessingIds] = useState<Record<string, boolean>>({});
  const [selectedRoles, setSelectedRoles] = useState<Record<string, UserRole>>({});
  const [selectedTitles, setSelectedTitles] = useState<Record<string, string>>({});

  // Initialize selected roles/titles from users
  useEffect(() => {
    const initialRoles: Record<string, UserRole> = {};
    const initialTitles: Record<string, string> = {};
    
    pendingUsers.forEach(user => {
      initialRoles[user.id] = user.role || "employee";
      initialTitles[user.id] = user.title || "";
    });
    
    setSelectedRoles(initialRoles);
    setSelectedTitles(initialTitles);
  }, [pendingUsers]);

  const handleRoleChange = (userId: string, role: UserRole) => {
    setSelectedRoles(prev => ({ ...prev, [userId]: role }));
  };

  const handleTitleChange = (userId: string, title: string) => {
    setSelectedTitles(prev => ({ ...prev, [userId]: title }));
  };

  const handleApprove = async (user: User) => {
    try {
      setProcessingIds(prev => ({ ...prev, [user.id]: true }));
      console.log("Starting approval process for user:", user.id);
      
      // First approve the user
      await approveUser(user.id);
      console.log("User approved successfully");
      
      // Get the selected role and title
      const role = selectedRoles[user.id] || "employee";
      const title = selectedTitles[user.id];
      
      // Update profile in Supabase directly to set role and title
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          role: role,
          department: title === 'none' ? null : title,
          is_approved: true 
        })
        .eq('id', user.id);
        
      if (updateError) {
        console.error("Error updating profile directly:", updateError);
        toast.error("Error updating user role and title");
      } else {
        // Also update the user_roles table
        // First delete any existing role
        const { error: deleteError } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', user.id);
        
        if (deleteError) {
          console.error("Error deleting existing user role:", deleteError);
        }
        
        // Insert the new role - match the existing app_role enum
        const dbRole = mapAppRoleToDbRole(role);
        const { error: insertError } = await supabase
          .from('user_roles')
          .insert({
            user_id: user.id,
            role: dbRole as any // Use as any to bypass type checking temporarily
          });
        
        if (insertError && !insertError.message.includes('duplicate')) {
          console.error("Error inserting user role:", insertError);
        }
        
        // Update role and title in local state
        updateUserRole(user.id, role);
        if (title && title !== 'none') {
          updateUserTitle(user.id, title);
        }
      }
      
      // Send approval email via Supabase Edge Function if it exists
      try {
        console.log("Sending approval email for user:", user.name, user.email, role);
        
        const { error } = await supabase.functions.invoke("send-approval-email", {
          body: {
            name: user.name,
            email: user.email,
            role: role
          }
        });
        
        if (error) {
          console.error("Error sending approval email:", error);
        }
      } catch (emailError) {
        console.error("Failed to send approval email:", emailError);
        // Continue with approval process even if email fails
      }
      
      toast.success(`User ${user.name} has been approved as ${role}`);
      onRefresh();
    } catch (error) {
      console.error("Error in handleApprove:", error);
      toast.error(`Failed to approve user: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setProcessingIds(prev => ({ ...prev, [user.id]: false }));
    }
  };

  const handleReject = async (userId: string) => {
    try {
      setProcessingIds(prev => ({ ...prev, [userId]: true }));
      console.log("Rejecting user:", userId);
      await rejectUser(userId);
      toast.success("User has been rejected");
      onRefresh();
    } catch (error) {
      console.error("Error rejecting user:", error);
      toast.error(`Failed to reject user: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setProcessingIds(prev => ({ ...prev, [userId]: false }));
    }
  };

  if (pendingUsers.length === 0) {
    return <PendingUsersEmptyState />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Approvals</CardTitle>
        <CardDescription>Approve or reject new user registrations</CardDescription>
      </CardHeader>
      <CardContent>
        <PendingUsersTable
          pendingUsers={pendingUsers}
          processingIds={processingIds}
          selectedRoles={selectedRoles}
          selectedTitles={selectedTitles}
          onRoleChange={handleRoleChange}
          onTitleChange={handleTitleChange}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      </CardContent>
    </Card>
  );
};

export default PendingUsersList;
