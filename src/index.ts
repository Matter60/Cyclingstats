import { Hono } from "hono";

import { getRiderData } from "./getRiderData";
import { getTeamsData } from "./getTeamsData";

const app = new Hono();

app.get("/", (c) => {
  return c.html(
    `<h1>This is an api about cycling stats using hono and cheerio</h1>`
  );
});

app.get("/rider/:name", async (c) => {
  const name = c.req.param("name");
  if (!name) {
    return c.json({ error: "Name parameter is required" }, 400);
  }

  try {
    const data = await getRiderData(name);
    return c.json(data);
  } catch (error) {
    return c.json({ error: "Failed to fetch rider data" }, 500);
  }
});

app.get("/teams", async (c) => {
  try {
    const data = await getTeamsData();
    return c.json(data);
  } catch (error) {
    return c.json({ error: "Failed to fetch teams data" }, 500);
  }
});

export default app;
