import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  Calendar,
  ClipboardList,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Trophy,
  User,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { rolePermissions } from "@/components/employees/employee-details/role-permissions/constants";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const AppSidebar = ({ isOpen, onClose }: SidebarProps) => {
  const location = useLocation();
  const { currentUser, logout } = useAuth();
  const userRole = currentUser?.role || "employee";
  const userPermissions = rolePermissions[userRole] || [];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const allLinks = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
      requiredPermission: null,
    },
    {
      name: "All Tasks",
      path: "/tasks",
      icon: <ClipboardList className="h-5 w-5" />,
      requiredPermission: "view_tasks",
    },
    {
      name: "Calendar",
      path: "/calendar",
      icon: <Calendar className="h-5 w-5" />,
      requiredPermission: "view_tasks",
    },
    {
      name: "Employees",
      path: "/employees",
      icon: <Users className="h-5 w-5" />,
      requiredPermission: "manage_users",
    },
    {
      name: "Reports",
      path: "/reports",
      icon: <BarChart3 className="h-5 w-5" />,
      requiredPermission: "view_reports",
    },
    {
      name: "Achievements",
      path: "/achievements",
      icon: <Trophy className="h-5 w-5" />,
      requiredPermission: null,
    },
    {
      name: "Role Permissions",
      path: "/settings/roles",
      icon: <Shield className="h-5 w-5" />,
      requiredPermission: "manage_users",
    },
    {
      name: "Settings",
      path: "/settings",
      icon: <Settings className="h-5 w-5" />,
      requiredPermission: null,
    },
  ];

  const links = allLinks.filter(link => {
    if (link.requiredPermission === null || userRole === "admin") {
      return true;
    }
    return userPermissions.includes(link.requiredPermission);
  });

  return (
    <div
      className={cn(
        "fixed inset-y-0 left-0 z-20 flex w-64 flex-col border-r border-border/40 bg-sidebar pt-16 transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <div className="flex-1 overflow-y-auto py-6 px-4">
        <nav className="space-y-1">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={onClose}
              className={cn(
                "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-all",
                isActive(link.path)
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <span className="mr-3">{link.icon}</span>
              {link.name}
            </Link>
          ))}
        </nav>
      </div>
      <div className="space-y-1 px-4 mb-2">
        <Link
          to="/profile"
          onClick={onClose}
          className={cn(
            "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-all",
            isActive("/profile")
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <span className="mr-3"><User className="h-5 w-5" /></span>
          Profile
        </Link>
      </div>
      <div className="border-t border-border/40 p-4">
        <Button 
          variant="outline" 
          className="w-full justify-start text-muted-foreground hover:text-red-500 hover:border-red-200" 
          onClick={() => logout()}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </Button>
      </div>
    </div>
  );
};

export default AppSidebar;
