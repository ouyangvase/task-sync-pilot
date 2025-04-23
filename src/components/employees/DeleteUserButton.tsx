
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
import { supabase } from "@/integrations/supabase/client";

interface DeleteUserButtonProps {
  user: User;
  onDeleteSuccess?: () => void;
}

const DeleteUserButton = ({ user, onDeleteSuccess }: DeleteUserButtonProps) => {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { currentUser, users, setUsers, rejectUser } = useAuth();
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
      
      // First, delete all user permission records for this user
      try {
        if (user.id && !user.id.includes('user_')) {
          // Delete permissions where the user is the target
          await supabase
            .from('user_permissions')
            .delete()
            .eq('target_user_id', user.id);
            
          // Delete permissions owned by the user
          await supabase
            .from('user_permissions')
            .delete()
            .eq('user_id', user.id);
        }
      } catch (permError) {
        console.error("Error deleting user permissions:", permError);
        // Continue with deletion even if permissions delete fails
      }
      
      // Delete tasks associated with the user
      const updatedTasks = tasks.filter(task => task.assignee !== user.id);
      setTasks(updatedTasks);
      
      // Check if it's a real Supabase user or a mock user
      const isRealUser = user.id && !user.id.includes('user_');
      
      if (isRealUser) {
        // Use the rejectUser function to delete from Supabase
        await rejectUser(user.id);
      } else {
        // For mock users, just update local state
        // Filter out the user to be deleted
        const updatedUsers = users.filter(u => u.id !== user.id);
        setUsers(updatedUsers);
      }
      
      // Log the deletion action
      console.log("User deletion:", {
        adminId: currentUser?.id,
        adminName: currentUser?.name,
        action: "user_deletion",
        targetUserId: user.id,
        targetUserName: user.name,
        timestamp: new Date().toISOString()
      });
      
      // Show success notification
      toast.success(`User ${user.name} has been deleted successfully`);
      
      // Close the confirmation dialog
      handleCloseDialog();
      
      // Call onDeleteSuccess callback if provided
      if (onDeleteSuccess) {
        onDeleteSuccess();
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user. Please try again.");
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
