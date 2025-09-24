"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerChat = registerChat;
const chatGateway_1 = require("../socket/chatGateway");
function registerChat(io) {
    const gateway = new chatGateway_1.ChatGateway(io);
    gateway.register();
}
