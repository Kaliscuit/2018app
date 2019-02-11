const socketio = require("socket.io");
const chalk = require('chalk');  

let chat = {};
chat.io = null;
//初始化
chat.init = function (http) {
    this.io = socketio(http);
    this.listen();
}
//监听
chat.listen = function () {
    const that = this;
    this.io.on("connection", function (socket) {
        // console.log("已连接websocket", socket.id);
        // socket.on("info", function (obj) {
        //     // console.log(obj);
        //     socket.broadcast.emit("info", obj);
        // });
        // socket.on("error", function (obj) {
        //     // console.log(obj);
        //     socket.broadcast.emit("error", obj);
        // });
    });
};
//主动发送消息
chat.emitMsg = function (msg) {
    if (this.io) {
        // console.log(chalk.blue("发送消息", msg.data.title));
        this.io.sockets.emit("info", msg);
    }
}
chat.emitErr = function (msg) {
    if (this.io) {
        // console.log(chalk.red("发送错误", msg.data.title));
        this.io.sockets.emit("error", msg);
    }
}

module.exports = chat;