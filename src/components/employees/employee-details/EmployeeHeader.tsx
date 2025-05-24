
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CardTitle, CardDescription } from "@/components/ui/card";
import { User } from "@/types";
import { Mail, Crown, Shield, Users, Award } from "lucide-react";

interface EmployeeHeaderProps {
  employee: User;
  titleIcons: Record<string, React.ReactNode>;
}

export const EmployeeHeader = ({ employee, titleIcons }: EmployeeHeaderProps) => {
  // Helper function to get role icon and color
  const getRoleDisplay = (role: string) => {
    switch (role) {
      case "admin":
        return { 
          icon: <Crown className="h-4 w-4 text-yellow-500" />, 
          label: "Administrator",
          className: "text-yellow-600 bg-yellow-50"
        };
      case "manager":
        return { 
          icon: <Shield className="h-4 w-4 text-blue-500" />, 
          label: "Manager",
          className: "text-blue-600 bg-blue-50"
        };
      case "team_lead":
        return { 
          icon: <Users className="h-4 w-4 text-green-500" />, 
          label: "Team Lead",
          className: "text-green-600 bg-green-50"
        };
      default:
        return { 
          icon: <Award className="h-4 w-4 text-gray-500" />, 
          label: "Employee",
          className: "text-gray-600 bg-gray-50"
        };
    }
  };

  const roleDisplay = getRoleDisplay(employee.role);

  return (
    <div className="flex items-center space-x-4">
      <Avatar className="h-16 w-16">
        <AvatarImage src={employee.avatar} alt={employee.name} />
        <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
      </Avatar>
      <div>
        <div className="flex items-center gap-3 mb-1">
          <CardTitle className="text-2xl">{employee.name}</CardTitle>
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${roleDisplay.className}`}>
            {roleDisplay.icon}
            {roleDisplay.label}
          </span>
        </div>
        {employee.title && (
          <div className="flex items-center gap-1 mt-1">
            {titleIcons[employee.title]}
            <span className="text-sm font-medium text-muted-foreground">
              {employee.title}
            </span>
          </div>
        )}
        <CardDescription className="flex items-center mt-1">
          <Mail className="h-4 w-4 mr-1" />
          {employee.email}
        </CardDescription>
      </div>
    </div>
  );
};
