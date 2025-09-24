"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SignalingRepository = void 0;
class SignalingRepository {
    constructor() {
        this.rooms = new Map();
    }
    async getRoom(roomId) {
        return this.rooms.get(roomId) || null;
    }
    async joinRoom(roomId, socketId) {
        let room = this.rooms.get(roomId);
        if (!room) {
            room = { id: roomId, participants: [] };
            this.rooms.set(roomId, room);
        }
        if (!room.participants.includes(socketId) && room.participants.length < 2) {
            room.participants.push(socketId);
        }
        const peers = room.participants.filter((id) => id !== socketId);
        return { roomId, self: socketId, peers };
    }
    async leaveRoom(roomId, socketId) {
        const room = this.rooms.get(roomId);
        if (!room) {
            throw new Error(`Room ${roomId} not found`);
        }
        ;
        room.participants = room.participants.filter((id) => id !== socketId);
        if (room.participants.length === 0) {
            this.rooms.delete(roomId);
        }
        else {
            this.rooms.set(roomId, room);
        }
        return { roomId, self: socketId, peers: room.participants };
    }
}
exports.SignalingRepository = SignalingRepository;
