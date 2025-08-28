import { LeaveResult } from "../entities/Room";

export interface ILeaveRoomService{
    execute(roomId:string, socketId:string):Promise<LeaveResult>
}