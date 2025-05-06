
// Database role enum type matching Supabase's app_role values
export type DbRole = "admin" | "landlord" | "tenant" | "merchant";

// Application role type
import { UserRole } from "@/types";

// Map application role to database role
export const mapAppRoleToDbRole = (appRole: UserRole | string): DbRole => {
  switch (appRole) {
    case "admin":
      return "admin"; // This one is the same
    case "manager":
      return "landlord"; // Map manager to landlord
    case "team_lead":
      return "tenant"; // Map team_lead to tenant
    case "employee":
    default:
      return "merchant"; // Map employee to merchant
  }
};

// Map database role to application role
export const mapDbRoleToAppRole = (dbRole: DbRole | string): UserRole => {
  switch (dbRole) {
    case "admin":
      return "admin"; // This one is the same
    case "landlord":
      return "manager"; // Map landlord to manager
    case "tenant":
      return "team_lead"; // Map tenant to team_lead
    case "merchant":
    default:
      return "employee"; // Map merchant to employee
  }
};
