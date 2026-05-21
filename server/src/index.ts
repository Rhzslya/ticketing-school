import { web } from "./application/web";
import { prisma } from "./lib/prisma";

web.get("/", (c) => {
  return c.text("Halo, School Ticketing is Running");
});

export default {
  port: 3000,
  fetch: web.fetch,
};
