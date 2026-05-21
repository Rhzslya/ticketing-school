import { Hono } from "hono";
import { UserController } from "../controller/user-controller";

export const publicRouter = new Hono();

// User Public Routes
publicRouter.post("/api/users", (c) => UserController.register(c));
publicRouter.post("/api/auth/login", (c) => UserController.login(c));
