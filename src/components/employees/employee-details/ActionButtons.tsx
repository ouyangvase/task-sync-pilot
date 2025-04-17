
import { Button } from "@/components/ui/button";
import { PlusCircle, ShieldOff } from "lucide-react";
import { User } from "@/types";

interface ActionButtonsProps {
  employee: User;
  onTaskDialogOpen: () => void;
  canEdit?: boolean;
}

export function ActionButtons({ employee, onTaskDialogOpen, canEdit = false }: ActionButtonsProps) {
  return (
    <div className="flex space-x-2">
      {canEdit ? (
        <Button variant="outline" size="sm" onClick={onTaskDialogOpen}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Assign Task
        </Button>
      ) : (
        <Button variant="outline" size="sm" disabled title="You don't have permission to assign tasks">
          <ShieldOff className="h-4 w-4 mr-2" />
          No Access
        </Button>
      )}
    </div>
  );
}
