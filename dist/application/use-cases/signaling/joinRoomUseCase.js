"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JoinRoomUseCase = void 0;
class JoinRoomUseCase {
    constructor(_signalingRepository) {
        this._signalingRepository = _signalingRepository;
    }
    execute(roomId, socketId) {
        return this._signalingRepository.joinRoom(roomId, socketId);
    }
}
exports.JoinRoomUseCase = JoinRoomUseCase;
