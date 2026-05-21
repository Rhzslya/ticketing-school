import type { Context, Next } from "hono";
import type { ApplicationVariables } from "../type/hono-context";
import { UserRole } from "../src/generated/prisma/enums";

export const adminMiddleware = async (
  c: Context<{ Variables: ApplicationVariables }>,
  next: Next,
) => {
  const user = c.var.user;

  if (!user) {
    return c.json(
      {
        errors: "Unauthorized",
      },
      401,
    );
  }

  if (user.role !== UserRole.ADMIN) {
    return c.json(
      {
        errors: "Forbidden: Insufficient permissions",
      },
      403,
    );
  }

  await next();
};
