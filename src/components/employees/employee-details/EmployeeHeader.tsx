
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CardTitle, CardDescription } from "@/components/ui/card";
import { User } from "@/types";
import { Mail } from "lucide-react";

interface EmployeeHeaderProps {
  employee: User;
  titleIcons: Record<string, React.ReactNode>;
}

export const EmployeeHeader = ({ employee, titleIcons }: EmployeeHeaderProps) => {
  return (
    <div className="flex items-center space-x-4">
      <Avatar className="h-16 w-16">
        <AvatarImage src={employee.avatar} alt={employee.name} />
        <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
      </Avatar>
      <div>
        <CardTitle className="text-2xl">{employee.name}</CardTitle>
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
