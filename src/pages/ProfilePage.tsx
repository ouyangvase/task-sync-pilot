
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import ProfileForm from "@/components/profile/ProfileForm";
import ChangePasswordForm from "@/components/profile/ChangePasswordForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { User } from "lucide-react";

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState("general");
  const { currentUser } = useAuth();

  if (!currentUser) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center gap-2 mb-6">
        <User className="h-6 w-6 text-muted-foreground" />
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList>
          <TabsTrigger value="general">General Information</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <div className="space-y-0.5">
            <h2 className="text-xl font-semibold tracking-tight">
              General Information
            </h2>
            <p className="text-muted-foreground">
              Manage your profile details and preferences.
            </p>
          </div>
          <Separator className="my-6" />
          <ProfileForm user={currentUser} />
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <div className="space-y-0.5">
            <h2 className="text-xl font-semibold tracking-tight">
              Security Settings
            </h2>
            <p className="text-muted-foreground">
              Manage your password and account security.
            </p>
          </div>
          <Separator className="my-6" />
          <ChangePasswordForm />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfilePage;
