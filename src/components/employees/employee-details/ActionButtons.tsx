
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, ShieldOff, Trash2 } from "lucide-react";
import { User } from "@/types";
import DeleteUserDialog from "../DeleteUserDialog";

interface ActionButtonsProps {
  employee: User;
  onTaskDialogOpen: () => void;
  canEdit?: boolean;
  isAdmin?: boolean;
  currentUserId?: string;
  onDeleteUser?: (userId: string) => Promise<boolean>;
}

export function ActionButtons({ 
  employee, 
  onTaskDialogOpen, 
  canEdit = false, 
  isAdmin = false,
  currentUserId,
  onDeleteUser 
}: ActionButtonsProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!onDeleteUser) return;
    
    setIsDeleting(true);
    try {
      const success = await onDeleteUser(employee.id);
      if (success) {
        setIsDeleteDialogOpen(false);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const canDeleteUser = isAdmin && currentUserId !== employee.id && onDeleteUser;

  return (
    <>
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
        
        {canDeleteUser && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleDeleteClick}
            className="text-destructive hover:text-destructive"
            title="Delete user account"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        )}
      </div>

      <DeleteUserDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        user={employee}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </>
  );
}
