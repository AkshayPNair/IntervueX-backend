import { LeaveResult } from "@/domain/entities/Room";
import { ILeaveRoomService } from "../../../domain/interfaces/ILeaveRoomService";
import { ISignalingRepository } from "../../../domain/interfaces/ISignalingRepository";

export class LeaveRoomUseCase implements ILeaveRoomService{
    constructor(
        private _signalingRepository:ISignalingRepository
    ){}

    execute(roomId:string, socketId:string):Promise<LeaveResult>{
        return this._signalingRepository.leaveRoom(roomId,socketId)
    }
}