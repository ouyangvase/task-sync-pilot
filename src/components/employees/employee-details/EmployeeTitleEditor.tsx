import { Award } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { User } from "@/types";
import { EMPLOYEE_TITLES } from "./constants";

interface EmployeeTitleEditorProps {
  employee: User;
  titleIcons: Record<string, React.ReactNode>;
  isAdmin: boolean;
  onUpdateTitle: (userId: string, title: string) => void;
}

export const EmployeeTitleEditor = ({ 
  employee,
  titleIcons,
  isAdmin,
  onUpdateTitle
}: EmployeeTitleEditorProps) => {
  const [selectedTitle, setSelectedTitle] = useState(employee.title || "");
  const [isTitleEditing, setIsTitleEditing] = useState(false);
  
  const handleSaveTitle = () => {
    onUpdateTitle(employee.id, selectedTitle);
    setIsTitleEditing(false);
  };

  // If not an admin, don't render
  if (!isAdmin) return null;
  
  return (
    <div className="mt-4 p-3 border border-border rounded-md bg-background/50">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium">Employee Title</h3>
        {isTitleEditing ? (
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => {
                setSelectedTitle(employee.title || "");
                setIsTitleEditing(false);
              }}
            >
              Cancel
            </Button>
            <Button 
              size="sm" 
              onClick={handleSaveTitle}
            >
              Save
            </Button>
          </div>
        ) : (
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => setIsTitleEditing(true)}
          >
            Edit Title
          </Button>
        )}
      </div>
      
      {isTitleEditing ? (
        <div className="mt-2">
          <Select 
            value={selectedTitle} 
            onValueChange={setSelectedTitle}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a title" />
            </SelectTrigger>
            <SelectContent>
              {EMPLOYEE_TITLES.map(title => (
                <SelectItem key={title} value={title}>
                  <span className="flex items-center gap-2">
                    {titleIcons[title]}
                    {title}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : (
        <div className="mt-2">
          {employee.title ? (
            <div className="flex items-center gap-2 py-2 px-3 bg-muted rounded-md">
              {titleIcons[employee.title]}
              <span>{employee.title}</span>
            </div>
          ) : (
            <div className="py-2 px-3 text-muted-foreground italic bg-muted rounded-md">
              No title assigned
            </div>
          )}
        </div>
      )}
    </div>
  );
};
