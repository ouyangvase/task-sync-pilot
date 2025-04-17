
import React, { useState } from "react";
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
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import { useAuth } from "@/contexts/auth";
import { User } from "@/types";
import { toast } from "sonner";
import { useTasks } from "@/contexts/TaskContext";

interface DeleteUserButtonProps {
  user: User;
  onDeleteSuccess?: () => void;
}

const DeleteUserButton = ({ user, onDeleteSuccess }: DeleteUserButtonProps) => {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { currentUser, users, setUsers } = useAuth();
  const { tasks, setTasks } = useTasks();

  // Check if current user is admin
  const isAdmin = currentUser?.role === "admin";
  
  if (!isAdmin) return null;

  const handleOpenDialog = () => {
    setIsConfirmOpen(true);
  };

  const handleCloseDialog = () => {
    setIsConfirmOpen(false);
  };

  const handleDeleteUser = async () => {
    try {
      setIsDeleting(true);
      
      // In a real system with a backend, you would make an API call here
      // For now, we'll simulate a delay and update the local state
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Filter out the user to be deleted
      const updatedUsers = users.filter(u => u.id !== user.id);
      
      // Also delete all tasks associated with this user
      const updatedTasks = tasks.filter(task => task.assignee !== user.id);
      
      // Update users and tasks state
      await setUsers();
      setTasks(updatedTasks);
      
      // Log the deletion action (in a real system, this would be sent to the backend)
      const logEntry = {
        adminId: currentUser?.id,
        adminName: currentUser?.name,
        action: "user_deletion",
        targetUserId: user.id,
        targetUserName: user.name,
        timestamp: new Date().toISOString()
      };
      
      console.log("User deletion log:", logEntry);
      
      // Show success notification
      toast.success(`User ${user.name} has been deleted along with all associated tasks`);
      
      // Close the confirmation dialog
      handleCloseDialog();
      
      // Call onDeleteSuccess callback if provided
      if (onDeleteSuccess) {
        onDeleteSuccess();
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Button 
        variant="destructive" 
        size="sm" 
        onClick={handleOpenDialog}
        className="flex items-center gap-1 text-xs"
      >
        <Trash className="h-3 w-3" />
        Delete
      </Button>

      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {user.name}? This action cannot be undone.
              All tasks, points, history, and permissions for this user will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete User"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default DeleteUserButton;
