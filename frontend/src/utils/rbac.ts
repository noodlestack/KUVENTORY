export type RoleName = 
  | "Administrator"
  | "Manager"
  | "Inventory Staff"
  | "Cashier"
  | "Kitchen Staff"
  | "Viewer";

export function hasRole(userRoles: RoleName[], role: RoleName): boolean {
  return userRoles.includes(role);
}

export function hasAnyRole(userRoles: RoleName[], roles: RoleName[]): boolean {
  return roles.some((role) => userRoles.includes(role));
}

export function hasAllRoles(userRoles: RoleName[], roles: RoleName[]): boolean {
  return roles.every((role) => userRoles.includes(role));
}

export function isAdmin(userRoles: RoleName[]): boolean {
  return hasRole(userRoles, "Administrator");
}
