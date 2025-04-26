
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
  const { currentUser, users, setUsers } = useAuth();
  const { tasks, setTasks } = useTasks();

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
      
      // First, delete the user's profile and all related data
      if (user.id && !user.id.includes('user_')) {
        const { error: deleteError } = await supabase
          .from('profiles')
          .delete()
          .eq('id', user.id);
          
        if (deleteError) {
          throw new Error(`Failed to delete user profile: ${deleteError.message}`);
        }
        
        // Delete from auth.users if possible (requires admin rights)
        const { error: authDeleteError } = await supabase.auth.admin.deleteUser(user.id);
        if (authDeleteError) {
          console.error("Could not delete auth user:", authDeleteError);
        }
      }
      
      // Update local state
      setUsers(users.filter(u => u.id !== user.id));
      setTasks(tasks.filter(task => task.assignee !== user.id));
      
      toast.success(`User ${user.name} has been permanently deleted`);
      handleCloseDialog();
      
      if (onDeleteSuccess) {
        onDeleteSuccess();
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error(`Failed to delete user: ${error instanceof Error ? error.message : String(error)}`);
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
              All tasks, roles, permissions and related data will be permanently removed.
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
