
import { useState } from "react";
import { useAuth } from "@/contexts/auth";
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
import { supabase } from "@/integrations/supabase/client";

interface PendingUsersListProps {
  pendingUsers: User[];
  onRefresh: () => void;
}

const PendingUsersList = ({ pendingUsers, onRefresh }: PendingUsersListProps) => {
  const { approveUser, rejectUser, updateUserRole, updateUserTitle } = useAuth();
  const [processingIds, setProcessingIds] = useState<Record<string, boolean>>({});
  const [selectedRoles, setSelectedRoles] = useState<Record<string, UserRole>>({});
  const [selectedTitles, setSelectedTitles] = useState<Record<string, string>>({});

  const handleRoleChange = (userId: string, role: UserRole) => {
    setSelectedRoles(prev => ({ ...prev, [userId]: role }));
  };

  const handleTitleChange = async (userId: string, title: string) => {
    setSelectedTitles(prev => ({ ...prev, [userId]: title }));
    try {
      await updateUserTitle(userId, title);
      toast.success("Title updated successfully");
    } catch (error) {
      toast.error(`Failed to update title: ${error}`);
    }
  };

  const handleApprove = async (user: User) => {
    try {
      setProcessingIds(prev => ({ ...prev, [user.id]: true }));
      await approveUser(user.id);
      const role = selectedRoles[user.id] || "employee";
      await updateUserRole(user.id, role);
      
      // Send approval email via Supabase Edge Function
      try {
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
              const selectedRole = selectedRoles[user.id] || "employee";
              const selectedTitle = selectedTitles[user.id] || "none";

              return (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Select 
                      value={selectedRole} 
                      onValueChange={(value) => handleRoleChange(user.id, value as UserRole)}
                    >
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
                    <Select 
                      value={selectedTitle} 
                      onValueChange={(value) => handleTitleChange(user.id, value)}
                    >
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
                        onClick={() => handleApprove(user)}
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
