
import React from "react";
import { Button } from "@/components/ui/button";

interface TaskFormActionsProps {
  onCancel?: () => void;
  isEditing: boolean;
  isSubmitting?: boolean;
}

const TaskFormActions: React.FC<TaskFormActionsProps> = ({ 
  onCancel, 
  isEditing,
  isSubmitting = false
}) => {
  return (
    <div className="flex justify-end gap-2">
      {onCancel && (
        <Button variant="outline" type="button" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
      )}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : (isEditing ? "Update" : "Create")} Task
      </Button>
    </div>
  );
};

export default TaskFormActions;
