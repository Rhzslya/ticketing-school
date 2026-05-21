import type { JWTPayload } from "hono/utils/jwt/types";
import { verify } from "hono/jwt";
import type { ApplicationVariables } from "../type/hono-context";
import { getCookie } from "hono/cookie";
import type { Context, Next } from "hono";
import { prismaClient } from "../src/lib/prisma";

interface TokenPayload extends JWTPayload {
  id: number;
}

export const authMiddleware = async (
  c: Context<{ Variables: ApplicationVariables }>,
  next: Next,
) => {
  const token = getCookie(c, "auth_token");

  if (!token) {
    return c.json({ errors: "Unauthorized" }, 401);
  }

  let payload: TokenPayload;

  try {
    const secret = process.env.JWT_SECRET!;
    payload = (await verify(token, secret, "HS256")) as TokenPayload;
  } catch (e) {
    return c.json(
      {
        errors: "Invalid or expired token",
        code: "INVALID_TOKEN",
      },
      401,
    );
  }

  const user = await prismaClient.user.findFirst({
    where: {
      id: payload.id,
    },
  });

  if (!user) {
    return c.json(
      {
        errors: "Session expired. You are logged in on another device.",
        code: "SESSION_EXPIRED",
      },
      401,
    );
  }

  c.set("user", user);

  await next();
};
