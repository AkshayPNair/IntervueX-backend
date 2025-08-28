import { Server } from "socket.io";
import { SignalingGateway } from "../socket/signalingGateway";

export function registerSignaling(io: Server) {
    const gateway = new SignalingGateway(io);
    gateway.register();
}