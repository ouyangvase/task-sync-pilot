
import { Button } from "@/components/ui/button";
import { UserCog, Trash } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState } from "react";
import { toast } from "sonner";
import { User } from "@/types";

interface ActionButtonsProps {
  employee: User;
  onTaskDialogOpen: () => void;
}

export const ActionButtons = ({ employee, onTaskDialogOpen }: ActionButtonsProps) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] = useState(false);
  
  const handleDeleteEmployee = () => {
    // In a real app, this would call an API to delete the user
    toast.success(`Employee ${employee.name} would be deleted`);
    setIsDeleteDialogOpen(false);
  };

  const handleResetPassword = () => {
    // In a real app, this would call an API to reset the user's password
    toast.success(`Password reset email sent to ${employee.email}`);
    setIsResetPasswordDialogOpen(false);
  };
  
  return (
    <div className="flex space-x-2">
      <Button onClick={onTaskDialogOpen} variant="default">Assign Task</Button>
      
      <Dialog open={isResetPasswordDialogOpen} onOpenChange={setIsResetPasswordDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">
            <UserCog className="h-4 w-4 mr-2" />
            Reset Password
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              This will send a password reset email to {employee.email}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsResetPasswordDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleResetPassword}>Reset Password</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="destructive">
            <Trash className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Employee</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {employee.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <Alert variant="destructive">
            <AlertDescription>
              This will permanently delete the employee and all their associated tasks.
            </AlertDescription>
          </Alert>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteEmployee}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
