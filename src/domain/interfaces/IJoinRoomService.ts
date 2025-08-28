import { JoinResult } from "../entities/Room";

export interface IJoinRoomService{
    execute(roomId:string,socketId:string, name?: string):Promise<JoinResult>
}