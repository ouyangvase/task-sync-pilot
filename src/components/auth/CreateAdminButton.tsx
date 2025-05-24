
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { createAdminAccount } from "@/utils/createAdminAccount";

const CreateAdminButton = () => {
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateAdmin = async () => {
    try {
      setIsCreating(true);
      await createAdminAccount();
      toast.success("Admin account created successfully! Email: admin@tasksync.com, Password: admin123456");
    } catch (error: any) {
      console.error("Error creating admin:", error);
      if (error.message?.includes("User already registered")) {
        toast.error("Admin account already exists");
      } else {
        toast.error("Failed to create admin account: " + error.message);
      }
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Button 
      onClick={handleCreateAdmin} 
      disabled={isCreating}
      variant="outline"
      size="sm"
      className="mt-4"
    >
      {isCreating ? "Creating Admin..." : "Create Admin Account"}
    </Button>
  );
};

export default CreateAdminButton;
