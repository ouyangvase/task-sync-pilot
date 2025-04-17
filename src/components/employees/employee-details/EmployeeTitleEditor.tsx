
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { User } from "@/types";
import { EMPLOYEE_TITLES } from "./constants";

interface EmployeeTitleEditorProps {
  employee: User;
  titleIcons: Record<string, React.ReactNode>;
  isAdmin: boolean;
  onUpdateTitle: (userId: string, title: string) => void;
  canEdit?: boolean;
}

export function EmployeeTitleEditor({ 
  employee, 
  titleIcons, 
  isAdmin,
  onUpdateTitle,
  canEdit = false
}: EmployeeTitleEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedTitle, setSelectedTitle] = useState(employee.title || "");

  // Only admins and users with edit permission can edit titles
  const hasEditPermission = isAdmin || canEdit;
  
  if (!hasEditPermission) return null;

  const handleSave = () => {
    onUpdateTitle(employee.id, selectedTitle);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setSelectedTitle(employee.title || "");
    setIsEditing(false);
  };

  return (
    <div className="flex items-center mt-2">
      {isEditing ? (
        <div className="flex items-center gap-3">
          <Select value={selectedTitle} onValueChange={setSelectedTitle}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select a title" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No Title</SelectItem>
              {EMPLOYEE_TITLES.map((title) => (
                <SelectItem key={title} value={title}>
                  <div className="flex items-center gap-2">
                    {titleIcons[title] && <span>{titleIcons[title]}</span>}
                    <span>{title}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="ghost" size="sm" onClick={handleCancel}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave}>
            Save
          </Button>
        </div>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground"
          onClick={() => setIsEditing(true)}
        >
          {employee.title ? `Edit Title: ${employee.title}` : "Add Title"}
        </Button>
      )}
    </div>
  );
}
