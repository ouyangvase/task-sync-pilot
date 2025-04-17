import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { 
  LayoutDashboard, 
  CheckSquare, 
  Calendar, 
  ClipboardCheck, 
  Users, 
  BarChart, 
  Settings,
  User
} from "lucide-react";

interface AppSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const AppSidebar = ({ isOpen, onClose }: AppSidebarProps) => {
  const location = useLocation();
  const { currentUser } = useAuth();
  
  if (!currentUser) return null;
  
  const isAdmin = currentUser.role === "admin";
  
  const navItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Tasks",
      href: "/tasks",
      icon: CheckSquare,
    },
    {
      name: "Calendar",
      href: "/calendar",
      icon: Calendar,
    },
    {
      name: "Completed",
      href: "/completed",
      icon: ClipboardCheck,
    },
    ...(isAdmin
      ? [
          {
            name: "Employees",
            href: "/employees",
            icon: Users,
          },
          {
            name: "Reports",
            href: "/reports",
            icon: BarChart,
          },
        ]
      : []),
    {
      name: "Settings",
      href: "/settings",
      icon: Settings,
    },
    {
      name: "My Profile",
      href: "/profile",
      icon: User,
    },
  ];

  const NavLink = ({ item }: { item: typeof navItems[0] }) => {
    const isActive = location.pathname === item.href;
    const Icon = item.icon;

    return (
      <Link
        to={item.href}
        onClick={() => onClose()}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-base transition-all hover:text-primary",
          isActive
            ? "bg-primary/10 text-primary font-medium"
            : "text-muted-foreground"
        )}
      >
        <Icon className="h-5 w-5" />
        {item.name}
      </Link>
    );
  };

  // For mobile, use Sheet component
  // For desktop, use regular sidebar
  return (
    <>
      {/* Mobile sidebar */}
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="left" className="w-64 p-0">
          <div className="flex flex-col h-full">
            <div className="p-6">
              <h2 className="text-lg font-semibold">TaskSync Pilot</h2>
            </div>
            <nav className="flex-1 px-3 space-y-1">
              {navItems.map((item) => (
                <NavLink key={item.href} item={item} />
              ))}
            </nav>
            <div className="p-4 border-t">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  // Handle logout
                }}
              >
                <span>Log out</span>
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-20 hidden w-64 flex-col border-r bg-background pt-16 md:flex transition-transform duration-300",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => (
            <NavLink key={item.href} item={item} />
          ))}
        </nav>
      </div>
    </>
  );
};

export default AppSidebar;
