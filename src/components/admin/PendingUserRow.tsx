
import { useState } from "react";
import { User, UserRole } from "@/types";
import {
  TableRow,
  TableCell
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { EMPLOYEE_TITLES } from "../employees/employee-details/constants";

interface PendingUserRowProps {
  user: User;
  isProcessing: boolean;
  selectedRole: UserRole;
  selectedTitle: string;
  onRoleChange: (userId: string, role: UserRole) => void;
  onTitleChange: (userId: string, title: string) => void;
  onApprove: (user: User) => void;
  onReject: (userId: string) => void;
}

const PendingUserRow = ({
  user,
  isProcessing,
  selectedRole,
  selectedTitle,
  onRoleChange,
  onTitleChange,
  onApprove,
  onReject
}: PendingUserRowProps) => {
  return (
    <TableRow key={user.id}>
      <TableCell>{user.name}</TableCell>
      <TableCell>{user.email}</TableCell>
      <TableCell>
        <Select 
          value={selectedRole} 
          onValueChange={(value) => onRoleChange(user.id, value as UserRole)}
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
          onValueChange={(value) => onTitleChange(user.id, value)}
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
            onClick={() => onApprove(user)}
            disabled={isProcessing}
          >
            Approve
          </Button>
          <Button 
            size="sm" 
            variant="destructive"
            onClick={() => onReject(user.id)}
            disabled={isProcessing}
          >
            Reject
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default PendingUserRow;
