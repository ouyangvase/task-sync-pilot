
// Database role enum type matching Supabase's app_role values
export type DbRole = "admin" | "tenant" | "landlord" | "merchant";

// Application role type
import { UserRole } from "@/types";
import { Database } from "@/integrations/supabase/types";

type AppRoleEnum = Database["public"]["Enums"]["app_role"];

// Map application role to database role
export const mapAppRoleToDbRole = (appRole: UserRole | string): AppRoleEnum => {
  let dbRole: DbRole;
  
  switch (appRole) {
    case "admin":
      dbRole = "admin"; // This one is the same
      break;
    case "manager":
      dbRole = "landlord"; // Map manager to landlord
      break;
    case "team_lead":
      dbRole = "tenant"; // Map team_lead to tenant
      break;
    case "employee":
    default:
      dbRole = "merchant"; // Map employee to merchant
      break;
  }
  
  // Cast to the specific enum type from the database
  return dbRole as AppRoleEnum;
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
