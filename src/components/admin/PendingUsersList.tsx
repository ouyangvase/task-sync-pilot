
import { useState } from "react";
import { useAuth } from "@/contexts/auth";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { User, UserRole } from "@/types";
import PendingUsersEmptyState from "./PendingUsersEmptyState";
import PendingUsersTable from "./PendingUsersTable";
import { usePendingUsers } from "@/hooks/usePendingUsers";

interface PendingUsersListProps {
  pendingUsers: User[];
  onRefresh: () => void;
}

const PendingUsersList = ({ pendingUsers, onRefresh }: PendingUsersListProps) => {
  const { updateUserRole, updateUserTitle } = useAuth();
  const { isProcessing, handleApprove, handleReject } = usePendingUsers();
  const [selectedRoles, setSelectedRoles] = useState<Record<string, UserRole>>({});
  const [selectedTitles, setSelectedTitles] = useState<Record<string, string>>({});

  const handleRoleChange = (userId: string, role: UserRole) => {
    setSelectedRoles(prev => ({ ...prev, [userId]: role }));
  };

  const handleTitleChange = (userId: string, title: string) => {
    setSelectedTitles(prev => ({ ...prev, [userId]: title }));
  };

  const handleApproveClick = async (user: User) => {
    const role = selectedRoles[user.id] || "employee";
    const title = selectedTitles[user.id];
    
    const success = await handleApprove(user, role, title);
    if (success) {
      // Update local state
      updateUserRole(user.id, role);
      if (title) {
        updateUserTitle(user.id, title);
      }
      onRefresh();
    }
  };

  const handleRejectClick = async (userId: string) => {
    const success = await handleReject(userId);
    if (success) {
      onRefresh();
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
          processingIds={isProcessing}
          selectedRoles={selectedRoles}
          selectedTitles={selectedTitles}
          onRoleChange={handleRoleChange}
          onTitleChange={handleTitleChange}
          onApprove={handleApproveClick}
          onReject={handleRejectClick}
        />
      </CardContent>
    </Card>
  );
};

export default PendingUsersList;
