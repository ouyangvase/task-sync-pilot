
import { useState } from "react";
import { User, UserRole } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import UserRoleSelect from "./UserRoleSelect";
import UserTitleSelect from "./UserTitleSelect";
import UserActions from "./UserActions";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface PendingUsersTableProps {
  pendingUsers: User[];
  onRefresh: () => void;
}

const PendingUsersTable = ({ pendingUsers, onRefresh }: PendingUsersTableProps) => {
  const { updateUserRole, updateUserTitle } = useAuth();
  const [processingIds, setProcessingIds] = useState<Record<string, boolean>>({});
  const [selectedRoles, setSelectedRoles] = useState<Record<string, UserRole>>({});
  const [selectedTitles, setSelectedTitles] = useState<Record<string, string>>({});

  const handleRoleChange = (userId: string, role: UserRole) => {
    setSelectedRoles(prev => ({ ...prev, [userId]: role }));
  };

  const handleTitleChange = (userId: string, title: string) => {
    setSelectedTitles(prev => ({ ...prev, [userId]: title }));
  };

  const handleApprove = async (user: User) => {
    try {
      setProcessingIds(prev => ({ ...prev, [user.id]: true }));
      
      // Update user role directly
      const role = selectedRoles[user.id] || "employee";
      await updateUserRole(user.id, role);
      
      // Update title if selected
      const title = selectedTitles[user.id];
      if (title) {
        await updateUserTitle(user.id, title);
      }
      
      // Send notification email via Supabase Edge Function
      try {
        console.log("Sending welcome email for user:", user.name, user.email, role);
        
        const { error } = await supabase.functions.invoke("send-approval-email", {
          body: {
            name: user.name,
            email: user.email,
            role: role
          }
        });
        
        if (error) {
          console.error("Error sending welcome email:", error);
          toast.error("Added user but failed to send notification email");
        }
      } catch (emailError) {
        console.error("Failed to send welcome email:", emailError);
      }
      
      toast.success(`User ${user.name} has been set as ${role}`);
      onRefresh();
    } catch (error) {
      console.error("Error in handleApprove:", error);
      toast.error(`Failed to update user: ${error}`);
    } finally {
      setProcessingIds(prev => ({ ...prev, [user.id]: false }));
    }
  };

  const handleRemove = async (userId: string) => {
    try {
      setProcessingIds(prev => ({ ...prev, [userId]: true }));
      toast.success("User has been removed");
      onRefresh();
    } catch (error) {
      toast.error(`Failed to remove user: ${error}`);
    } finally {
      setProcessingIds(prev => ({ ...prev, [userId]: false }));
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Title (Optional)</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {pendingUsers.map((user) => {
          const isProcessing = processingIds[user.id] || false;
          const selectedRole = selectedRoles[user.id] || "employee";
          const selectedTitle = selectedTitles[user.id] || "none";

          return (
            <TableRow key={user.id}>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <UserRoleSelect 
                  userId={user.id}
                  selectedRole={selectedRole}
                  onRoleChange={handleRoleChange}
                />
              </TableCell>
              <TableCell>
                <UserTitleSelect
                  userId={user.id}
                  selectedTitle={selectedTitle}
                  onTitleChange={handleTitleChange}
                />
              </TableCell>
              <TableCell>
                <UserActions 
                  user={user}
                  isProcessing={isProcessing}
                  onUpdate={handleApprove}
                  onRemove={handleRemove}
                />
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

export default PendingUsersTable;
