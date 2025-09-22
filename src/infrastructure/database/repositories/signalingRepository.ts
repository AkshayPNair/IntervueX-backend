import { ISignalingRepository } from "../../../domain/interfaces/ISignalingRepository";
import { JoinResult, SocketId, Room, LeaveResult } from "../../../domain/entities/Room";


export class SignalingRepository implements ISignalingRepository {
    private rooms: Map<string, Room> = new Map()

    async getRoom(roomId: string): Promise<Room | null> {
        return this.rooms.get(roomId) || null
    }

    async joinRoom(roomId: string, socketId: SocketId): Promise<JoinResult> {
        let room=this.rooms.get(roomId)
        if(!room){
            room={id:roomId, participants:[]}
            this.rooms.set(roomId,room)                  
        }
        if(!room.participants.includes(socketId) && room.participants.length<2){
            room.participants.push(socketId)
        }
        const peers=room.participants.filter((id)=> id!==socketId)
        return {roomId,self:socketId,peers}
    }

    async leaveRoom(roomId: string, socketId: SocketId): Promise<LeaveResult> {
        const room=this.rooms.get(roomId)
        if(!room){
            throw new Error(`Room ${roomId} not found`)
        };
        room.participants=room.participants.filter((id)=>id!==socketId)
        if(room.participants.length===0){
            this.rooms.delete(roomId)
        }else{
            this.rooms.set(roomId,room)
        }
        return{roomId,self:socketId,peers:room.participants}
    }

}