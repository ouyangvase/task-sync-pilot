
import { Button } from "@/components/ui/button";
import { UserActionsProps } from "./types";

const UserActions = ({ user, isProcessing, onUpdate, onRemove }: UserActionsProps) => {
  return (
    <div className="flex items-center gap-2">
      <Button 
        size="sm" 
        onClick={() => onUpdate(user)}
        disabled={isProcessing}
      >
        Update
      </Button>
      <Button 
        size="sm" 
        variant="destructive"
        onClick={() => onRemove(user.id)}
        disabled={isProcessing}
      >
        Remove
      </Button>
    </div>
  );
};

export default UserActions;
