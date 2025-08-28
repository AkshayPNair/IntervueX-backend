import { JoinResult } from "@/domain/entities/Room";
import { IJoinRoomService } from "../../../domain/interfaces/IJoinRoomService";
import { ISignalingRepository } from "../../../domain/interfaces/ISignalingRepository";

export class JoinRoomUseCase implements IJoinRoomService{
    constructor(
        private _signalingRepository:ISignalingRepository
    ){}

    execute(roomId:string,socketId:string):Promise<JoinResult>{
        return this._signalingRepository.joinRoom(roomId,socketId)
    }
}