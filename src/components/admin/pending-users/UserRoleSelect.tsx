
import { UserRoleSelectProps } from "./types";
import { UserRole } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const UserRoleSelect = ({ userId, selectedRole, onRoleChange }: UserRoleSelectProps) => {
  return (
    <Select 
      value={selectedRole} 
      onValueChange={(value) => onRoleChange(userId, value as UserRole)}
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
  );
};

export default UserRoleSelect;
