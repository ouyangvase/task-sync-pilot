
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { User, UserRole } from "@/types";
import { Loader2 } from "lucide-react";

interface ConfirmRoleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  employee: User;
  selectedRole: UserRole;
  isSaving?: boolean;
}

export function ConfirmRoleDialog({
  isOpen,
  onClose,
  onConfirm,
  employee,
  selectedRole,
  isSaving = false
}: ConfirmRoleDialogProps) {
  // Get a display-friendly version of the role name
  const getRoleDisplay = (role: UserRole) => {
    return role.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };
  
  const currentRole = getRoleDisplay(employee.role as UserRole);
  const newRole = getRoleDisplay(selectedRole);

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Role Change</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to change {employee.name}'s role from <strong>{currentRole}</strong> to <strong>{newRole}</strong>?
            <br /><br />
            This will affect their access level and permissions across the system.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isSaving}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => onConfirm()}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Confirm Change'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
