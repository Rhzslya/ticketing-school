import { Hono } from "hono";
import { UserController } from "../controller/user-controller";
import type { ApplicationVariables } from "../type/hono-context";
import { authMiddleware } from "../middleware/auth-middleware";
import { TicketController } from "../controller/ticket-controller";
import { ReplyController } from "../controller/reply-controller";
import { AiAnalayzeController } from "../controller/ai-analyze-controller";

export const apiRouter = new Hono<{ Variables: ApplicationVariables }>();

apiRouter.use(authMiddleware);

apiRouter.delete("/api/auth/logout", (c) => UserController.logout(c));
apiRouter.get("/api/users/current", UserController.get);

//API TICKET
apiRouter.post("/api/tickets", (c) => TicketController.create(c));
apiRouter.get("/api/tickets", (c) => TicketController.search(c));
apiRouter.get("/api/tickets/stats", (c) => TicketController.getStatistics(c));
apiRouter.patch("/api/tickets/:id", (c) => TicketController.update(c));
apiRouter.get("/api/tickets/:id", (c) => TicketController.get(c));
apiRouter.delete("/api/tickets/:id/delete", (c) => TicketController.remove(c));
apiRouter.patch("/api/tickets/:id/restore", (c) => TicketController.restore(c));
apiRouter.post("/api/tickets/analyze", (c) => AiAnalayzeController.analyze(c));

//API REPLY
apiRouter.get("/api/tickets/:id/replies", (c) => ReplyController.get(c));
apiRouter.post("/api/tickets/:id/replies", (c) => ReplyController.create(c));
