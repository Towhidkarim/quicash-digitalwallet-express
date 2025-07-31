export const Roles = {
  user: 'user',
  agent: 'agent',
  admin: 'admin',
} as const;
export type TRoles = keyof typeof Roles;
