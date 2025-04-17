
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
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
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Role Change</DialogTitle>
          <DialogDescription>
            Are you sure you want to change {employee.name}'s role from{" "}
            <span className="font-medium">{employee.role}</span> to{" "}
            <span className="font-medium">{selectedRole}</span>?
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-muted-foreground text-sm">
            This will update their access level and permissions in the system.
          </p>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onConfirm}>Confirm Change</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
