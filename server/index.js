const Koa = require("koa");
const static_files = require("koa-static");
const path = require("path");
const bodyParser = require('koa-bodyparser');
const opn = require('opn');
const os = require("../os.json");

const router = require("./router");
const chat = require("./chat");

const app = new Koa();

app.use(bodyParser({
    formLimit: "2mb",
    jsonLimit: "2mb"
}));

app.use(static_files(path.join(__dirname, "../dist")));
app.use(static_files(path.join(__dirname, "../public")));

app.use(router.routes()).use(router.allowedMethods());
let server = require('http').Server(app.callback());
chat.init(server);
const port = 18097;
server.listen(port, function () {
    console.log("启动log收集服务:" + port);
});
opn("http://127.0.0.1:" + port);
console.log("本地ip:" + os.ip);
