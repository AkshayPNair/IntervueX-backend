"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerSignaling = registerSignaling;
const signalingGateway_1 = require("../socket/signalingGateway");
function registerSignaling(io) {
    const gateway = new signalingGateway_1.SignalingGateway(io);
    gateway.register();
}
