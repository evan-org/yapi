const Koa = require("koa")
const router = require("./routes/index.js")
const app = new Koa()
app.use(router())


app.listen(3000)
