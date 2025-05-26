
import React from "react";
import { Button } from "@/components/ui/button";

interface TaskFormActionsProps {
  onCancel?: () => void;
  isEditing: boolean;
}

const TaskFormActions: React.FC<TaskFormActionsProps> = ({ 
  onCancel, 
  isEditing 
}) => {
  return (
    <div className="flex justify-end gap-2">
      {onCancel && (
        <Button variant="outline" type="button" onClick={onCancel}>
          Cancel
        </Button>
      )}
      <Button type="submit">{isEditing ? "Update" : "Create"} Task</Button>
    </div>
  );
};

export default TaskFormActions;
