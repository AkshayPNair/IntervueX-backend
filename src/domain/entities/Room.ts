export type SocketId=string;

export interface Room{
    id:string;
    participants:SocketId[]
}

export interface JoinResult{
    roomId:string;
    self:SocketId;
    peers:SocketId[]
}

export interface LeaveResult {
    roomId: string;
    self: SocketId;     
    peers: SocketId[];  
}

