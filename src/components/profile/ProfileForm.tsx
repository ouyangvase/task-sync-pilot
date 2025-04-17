
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { User } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Camera } from "lucide-react";

interface ProfileFormProps {
  user: User;
}

const ProfileForm = ({ user }: ProfileFormProps) => {
  const { currentUser } = useAuth();
  const [name, setName] = useState(user.name || "");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    user.avatar || null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      // This is a mock update since we don't have actual backend yet
      // In a real implementation, you would update the user profile in Supabase here
      
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
      
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error("Failed to update profile");
      console.error("Error updating profile:", error);
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
          <Input
            id="role"
            value={user.role}
            disabled
            className="bg-muted"
          />
        </div>
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : "Save Changes"}
      </Button>
    </form>
  );
};

export default ProfileForm;
