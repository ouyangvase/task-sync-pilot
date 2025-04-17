
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { User, UserRole } from "@/types";

interface ConfirmRoleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  employee: User;
  selectedRole: UserRole;
}

export function ConfirmRoleDialog({
  isOpen,
  onClose,
  onConfirm,
  employee,
  selectedRole
}: ConfirmRoleDialogProps) {
  // Only show confirmation when changing role
  const isRoleChanging = employee.role !== selectedRole;
  
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Update Role: {employee.name}</AlertDialogTitle>
          <AlertDialogDescription>
            {isRoleChanging ? (
              <>
                You are changing this user's role from <strong>{employee.role}</strong> to <strong>{selectedRole}</strong>.
                <p className="mt-2">
                  This will automatically update their permissions to match the standard permissions for the {selectedRole} role.
                </p>
                <p className="mt-2">
                  Are you sure you want to update this user's role and associated permissions?
                </p>
              </>
            ) : (
              <>
                You are updating the permissions for <strong>{employee.name}</strong>.
                <p className="mt-2">
                  Are you sure you want to save these changes?
                </p>
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            Update {isRoleChanging ? 'Role & Permissions' : 'Permissions'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
