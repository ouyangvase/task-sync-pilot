
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface RoleEditorActionsProps {
  isEditing: boolean;
  isSaving: boolean;
  hasChanges: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
}

export function RoleEditorActions({
  isEditing,
  isSaving,
  hasChanges,
  onEdit,
  onCancel,
  onSave
}: RoleEditorActionsProps) {
  if (!isEditing) {
    return (
      <Button variant="outline" size="sm" onClick={onEdit}>
        Edit Access
      </Button>
    );
  }

  return (
    <div className="flex gap-2">
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={onCancel}
        disabled={isSaving}
      >
        Cancel
      </Button>
      <Button
        size="sm"
        onClick={onSave}
        disabled={!hasChanges || isSaving}
        variant="default"
      >
        {isSaving ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          'Save Changes'
        )}
      </Button>
    </div>
  );
}
