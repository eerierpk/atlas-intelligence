// Frontend-only RBAC simulation. NOT a security boundary.
import type { UserRole } from "./store";

export type Permission =
  | "view:devices"
  | "edit:devices"           // expert content editing
  | "view:agents"
  | "run:agents"
  | "approve:content"        // expert review queue
  | "view:business-tools"
  | "manage:users";          // admin user provisioning

const MAP: Record<UserRole, Permission[]> = {
  Student: ["view:devices", "view:agents"],
  "Healthcare Professional": ["view:devices", "view:agents", "run:agents"],
  "Healthcare Expert": ["view:devices", "edit:devices", "view:agents", "run:agents", "approve:content"],
  "Business / Stakeholder": ["view:devices", "view:business-tools", "view:agents"],
  Admin: ["view:devices", "edit:devices", "view:agents", "run:agents", "approve:content", "view:business-tools", "manage:users"],
};

export function can(role: UserRole | undefined, perm: Permission): boolean {
  if (!role) return false;
  return MAP[role]?.includes(perm) ?? false;
}
