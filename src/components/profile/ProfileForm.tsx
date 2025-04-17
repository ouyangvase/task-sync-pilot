
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { User } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Camera } from "lucide-react";
import { rolePermissions } from "@/components/employees/employee-details/role-permissions/constants";

interface ProfileFormProps {
  user: User;
}

const ProfileForm = ({ user }: ProfileFormProps) => {
  const { currentUser, updateUserTitle } = useAuth();
  const [name, setName] = useState(user.name || "");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    user.avatar || null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get user role and permissions
  const userRole = currentUser?.role || "employee";
  const userPermissions = rolePermissions[userRole] || [];

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // This simulates updating the user profile
      if (currentUser && currentUser.id) {
        // Update the user's name
        updateUserTitle(currentUser.id, name);
        
        // In a real implementation with Supabase, you would upload the avatar file
        // and update the user's avatar URL here
        
        // For now, we're just simulating a successful update
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        // Update localStorage to persist the changes
        if (currentUser) {
          const updatedUser = {
            ...currentUser,
            name: name, // Update the name property
            avatar: avatarPreview
          };
          localStorage.setItem("currentUser", JSON.stringify(updatedUser));
        }
        
        toast.success("Profile updated successfully");
      } else {
        throw new Error("User is not authenticated");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generate a random id for avatar input
  const avatarInputId = `avatar-upload-${Math.random().toString(36).substring(2, 11)}`;

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
      <div className="space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          <div className="relative group">
            <Avatar className="w-24 h-24 border">
              <AvatarImage src={avatarPreview || ""} alt={name} />
              <AvatarFallback className="text-xl">
                {name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <label
              htmlFor={avatarInputId}
              className="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
            >
              <Camera className="h-6 w-6" />
              <span className="sr-only">Change profile picture</span>
            </label>
            <input
              id={avatarInputId}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-medium">Profile Picture</h3>
            <p className="text-sm text-muted-foreground">
              Click on the avatar to upload a new profile picture.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your full name"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            value={user.email}
            disabled
            className="bg-muted"
          />
          <p className="text-sm text-muted-foreground">
            Your email address cannot be changed.
          </p>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="role">Role</Label>
          <div className="flex items-center gap-2">
            <Input
              id="role"
              value={user.role}
              disabled
              className="bg-muted"
            />
            {userRole === "admin" && (
              <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                Admin privileges
              </span>
            )}
            {userRole === "manager" && (
              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                Manager privileges
              </span>
            )}
            {userRole === "team_lead" && (
              <span className="text-xs px-2 py-1 bg-amber-100 text-amber-800 rounded-full">
                Team Lead privileges
              </span>
            )}
          </div>
          {(userRole === "manager" || userRole === "team_lead") && (
            <p className="text-sm text-muted-foreground">
              {userRole === "manager" 
                ? "As a Manager, you can manage employees, tasks, and achievements." 
                : "As a Team Lead, you can manage your team's tasks and view employee information."}
            </p>
          )}
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="permissions">Permissions</Label>
          <div className="bg-muted p-3 rounded-md">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {userPermissions.map((permission, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-primary rounded-full"></div>
                  <span className="text-sm capitalize">
                    {permission.replace(/_/g, ' ')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : "Save Changes"}
      </Button>
    </form>
  );
};

export default ProfileForm;
