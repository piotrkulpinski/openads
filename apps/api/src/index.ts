import { Hono } from "hono"

const app = new Hono()

app.get("/", c => {
  return c.text("Hello Hono!")
})

const server = { port: 3001, fetch: app.fetch }

export default server
