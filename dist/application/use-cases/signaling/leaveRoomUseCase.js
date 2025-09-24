"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeaveRoomUseCase = void 0;
class LeaveRoomUseCase {
    constructor(_signalingRepository) {
        this._signalingRepository = _signalingRepository;
    }
    execute(roomId, socketId) {
        return this._signalingRepository.leaveRoom(roomId, socketId);
    }
}
exports.LeaveRoomUseCase = LeaveRoomUseCase;
