"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SignalingGateway = void 0;
const joinRoomUseCase_1 = require("../../application/use-cases/signaling/joinRoomUseCase");
const leaveRoomUseCase_1 = require("../../application/use-cases/signaling/leaveRoomUseCase");
const signalingRepository_1 = require("../../infrastructure/database/repositories/signalingRepository");
class SignalingGateway {
    constructor(io) {
        this.io = io;
        const signalingRepository = new signalingRepository_1.SignalingRepository();
        this._joinRoomUseCase = new joinRoomUseCase_1.JoinRoomUseCase(signalingRepository);
        this._leaveRoomUseCase = new leaveRoomUseCase_1.LeaveRoomUseCase(signalingRepository);
    }
    register() {
        this.io.on('connection', (socket) => this.handleConnection(socket));
    }
    async handleConnection(socket) {
        let currentRoom = null;
        socket.on('signaling:join', async ({ roomId }) => {
            currentRoom = roomId;
            const { peers } = await this._joinRoomUseCase.execute(roomId, socket.id);
            socket.join(roomId);
            // Inform existing peers about new participant
            peers.forEach((peerId) => {
                this.io.to(peerId).emit('signaling:peer-joined', { socketId: socket.id });
            });
            // Send existing peers to the new participant
            socket.emit('signaling:peers', { peers });
        });
        socket.on('signaling:offer', ({ to, sdp }) => {
            this.io.to(to).emit('signaling:offer', { from: socket.id, sdp });
        });
        socket.on('signaling:answer', ({ to, sdp }) => {
            this.io.to(to).emit('signaling:answer', { from: socket.id, sdp });
        });
        socket.on('signaling:candidate', ({ to, candidate }) => {
            this.io.to(to).emit('signaling:candidate', { from: socket.id, candidate });
        });
        socket.on('signaling:ping', ({ to }) => {
            this.io.to(to).emit('signaling:pong', { from: socket.id });
        });
        socket.on('disconnect', async () => {
            if (currentRoom) {
                await this._leaveRoomUseCase.execute(currentRoom, socket.id);
                socket.to(currentRoom).emit('signaling:peer-left', { socketId: socket.id });
            }
        });
    }
}
exports.SignalingGateway = SignalingGateway;
