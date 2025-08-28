import { JoinResult,LeaveResult,Room,SocketId } from "../entities/Room";

export interface ISignalingRepository{
    getRoom(roomId:string):Promise<Room|null>;
    joinRoom(roomId:string,socketId:SocketId):Promise<JoinResult>;
    leaveRoom(roomId:string, socketId:SocketId):Promise<LeaveResult>
}