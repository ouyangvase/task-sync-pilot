
import { useState } from "react";
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
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { User, UserRole } from "@/types";
import { toast } from "sonner";
import { EMPLOYEE_TITLES } from "../employees/employee-details/constants";
import { Badge } from "@/components/ui/badge";

interface PendingUsersListProps {
  pendingUsers: User[];
  onRefresh: () => void;
}

const PendingUsersList = ({ pendingUsers, onRefresh }: PendingUsersListProps) => {
  const { approveUser, rejectUser, updateUserRole, updateUserTitle } = useAuth();
  const [processingIds, setProcessingIds] = useState<Record<string, boolean>>({});

  const handleApprove = async (user: User, role: UserRole) => {
    try {
      setProcessingIds(prev => ({ ...prev, [user.id]: true }));
      await approveUser(user.id);
      await updateUserRole(user.id, role);
      toast.success(`User ${user.name} has been approved as ${role}`);
      onRefresh();
    } catch (error) {
      toast.error(`Failed to approve user: ${error}`);
    } finally {
      setProcessingIds(prev => ({ ...prev, [user.id]: false }));
    }
  };

  const handleReject = async (userId: string) => {
    try {
      setProcessingIds(prev => ({ ...prev, [userId]: true }));
      await rejectUser(userId);
      toast.success("User has been rejected");
      onRefresh();
    } catch (error) {
      toast.error(`Failed to reject user: ${error}`);
    } finally {
      setProcessingIds(prev => ({ ...prev, [userId]: false }));
    }
  };

  const handleTitleChange = async (userId: string, title: string) => {
    try {
      await updateUserTitle(userId, title);
      toast.success("Title updated successfully");
    } catch (error) {
      toast.error(`Failed to update title: ${error}`);
    }
  };

  if (pendingUsers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pending Approvals</CardTitle>
          <CardDescription>Users waiting for account approval</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center p-6 text-muted-foreground">
            No pending approval requests at the moment
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Approvals</CardTitle>
        <CardDescription>Approve or reject new user registrations</CardDescription>
      </CardHeader>
      <CardContent>
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
              const [selectedRole, setSelectedRole] = useState<UserRole>("employee");
              const [selectedTitle, setSelectedTitle] = useState<string>("none");

              return (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Select defaultValue="employee" onValueChange={(value) => setSelectedRole(value as UserRole)}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="employee">Employee</SelectItem>
                        <SelectItem value="team_lead">Team Lead</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select defaultValue="none" onValueChange={(value) => {
                      setSelectedTitle(value);
                      if (user.id) {
                        handleTitleChange(user.id, value);
                      }
                    }}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select title (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Title</SelectItem>
                        {EMPLOYEE_TITLES.map((title) => (
                          <SelectItem key={title} value={title}>{title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => handleApprove(user, selectedRole)}
                        disabled={isProcessing}
                      >
                        Approve
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => handleReject(user.id)}
                        disabled={isProcessing}
                      >
                        Reject
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default PendingUsersList;
