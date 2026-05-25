export const UserRole = {
  TEACHER: "TEACHER",
  ADMIN: "ADMIN",
};

export type UserRole = (typeof UserRole)[keyof typeof UserRole];
