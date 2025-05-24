
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { createAdminAccount } from "@/utils/createAdminAccount";

const CreateAdminButton = () => {
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateAdmin = async () => {
    try {
      setIsCreating(true);
      console.log("Starting admin account creation process...");
      
      const result = await createAdminAccount();
      
      if (result) {
        toast.success("Admin account created successfully! You can now login with admin@tasksync.com");
        console.log("Admin account creation completed successfully");
      }
    } catch (error: any) {
      console.error("Error creating admin:", error);
      
      if (error.message?.includes("User already registered")) {
        toast.success("Admin account already exists! You can login with admin@tasksync.com");
        console.log("Admin account already exists - this is OK");
      } else if (error.message?.includes("email address not authorized")) {
        toast.error("Email signup disabled. Please enable email signup in Supabase Auth settings.");
      } else {
        toast.error("Failed to create admin account: " + error.message);
      }
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-2">
      <Button 
        onClick={handleCreateAdmin} 
        disabled={isCreating}
        variant="outline"
        size="sm"
        className="w-full"
      >
        {isCreating ? "Creating Admin Account..." : "Create Admin Account"}
      </Button>
    </div>
  );
};

export default CreateAdminButton;
