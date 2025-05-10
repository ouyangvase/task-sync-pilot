
import { UserTitleSelectProps } from "./types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EMPLOYEE_TITLES } from "../../employees/employee-details/constants";

const UserTitleSelect = ({ userId, selectedTitle, onTitleChange }: UserTitleSelectProps) => {
  return (
    <Select 
      value={selectedTitle} 
      onValueChange={(value) => onTitleChange(userId, value)}
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
  );
};

export default UserTitleSelect;
