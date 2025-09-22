import {Server} from "socket.io"
import {ChatGateway} from "../socket/chatGateway"

export function registerChat(io: Server) {
    const gateway = new ChatGateway(io)
    gateway.register()
}