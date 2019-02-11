const Router = require('koa-router');
const chat = require("./chat");
const fs = require("fs");

let router = new Router();

router.get('/', (ctx, next) => {
    ctx.body = fs.readFileSync(__dirname + "/index.html").toString();
});
router.all('/code', (ctx, next) => {
    // console.log(ctx.request.body.title)
    ctx.body = "";
    const headers = ctx.headers;
    chat.emitMsg({
        data: ctx.request.body,
        headers,
        times: Date.now(),
        type:"info"
    })
});
router.all('/err', (ctx, next) => {
    // console.log(ctx.request.body.title)
    ctx.body = "";
    const headers = ctx.headers;
    chat.emitErr({
        data: ctx.request.body,
        headers,
        times: Date.now(),
        type:"err"
    })
});

module.exports = router;