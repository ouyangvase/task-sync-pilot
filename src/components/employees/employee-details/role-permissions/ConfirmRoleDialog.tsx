
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
import { Loader2, AlertTriangle } from "lucide-react";

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
  
  // Determine if this is a role promotion or demotion for extra warning
  const roleHierarchy = { "admin": 3, "manager": 2, "team_lead": 1, "employee": 0 };
  const isPromotion = (roleHierarchy[selectedRole as keyof typeof roleHierarchy] || 0) > 
                      (roleHierarchy[employee.role as keyof typeof roleHierarchy] || 0);
  const isDemotion = (roleHierarchy[selectedRole as keyof typeof roleHierarchy] || 0) < 
                    (roleHierarchy[employee.role as keyof typeof roleHierarchy] || 0);

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isDemotion ? (
              <span className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Confirm Role Demotion
              </span>
            ) : (
              "Confirm Role Change"
            )}
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            <p>
              Are you sure you want to change {employee.name}'s role from <strong>{currentRole}</strong> to <strong>{newRole}</strong>?
            </p>
            
            <p>
              This will affect their access level and permissions across the system.
            </p>
            
            {isPromotion && (
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md text-sm text-blue-800 dark:text-blue-300">
                This is a promotion that will grant {employee.name} additional permissions and access.
              </div>
            )}
            
            {isDemotion && (
              <div className="p-3 bg-amber-100 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md text-sm text-amber-800 dark:text-amber-300">
                This is a demotion that will reduce {employee.name}'s permissions and access.
                <br />
                All associated permissions will be automatically adjusted.
              </div>
            )}
            
            {employee.role === "admin" && selectedRole !== "admin" && (
              <div className="p-3 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-sm text-red-800 dark:text-red-300 flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Warning:</strong> You are removing admin privileges from this user. 
                  They will lose access to all administrative functions.
                </span>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isSaving}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => onConfirm()}
            disabled={isSaving}
            className={isDemotion ? "bg-amber-500 hover:bg-amber-600" : undefined}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                {isDemotion ? 'Confirm Demotion' : 'Confirm Change'}
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
