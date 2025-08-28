import { Server, Socket } from 'socket.io';
import { JoinRoomUseCase } from '../../application/use-cases/signaling/joinRoomUseCase';
import { LeaveRoomUseCase } from '../../application/use-cases/signaling/leaveRoomUseCase';
import { SignalingRepository } from '../../infrastructure/database/repositories/signalingRepository';
import { AnswerPayload, CandidatePayload, JoinPayload, OfferPayload, PeerLeftDTO, PeerJoinedDTO, PeersDTO } from '../../domain/dtos/signaling.dto';

export class SignalingGateway {
  private readonly _joinRoomUseCase: JoinRoomUseCase;
  private readonly _leaveRoomUseCase: LeaveRoomUseCase;

  constructor(private readonly io: Server) {
    const signalingRepository = new SignalingRepository();
    this._joinRoomUseCase = new JoinRoomUseCase(signalingRepository);
    this._leaveRoomUseCase = new LeaveRoomUseCase(signalingRepository);
  }

  public register() {
    this.io.on('connection', (socket: Socket) => this.handleConnection(socket));
  }

  private async handleConnection(socket: Socket) {
    let currentRoom: string | null = null;

    socket.on('signaling:join', async ({ roomId }: JoinPayload) => {
      currentRoom = roomId;
      const { peers } = await this._joinRoomUseCase.execute(roomId, socket.id);
      socket.join(roomId);

      // Inform existing peers about new participant
      peers.forEach((peerId) => {
        this.io.to(peerId).emit('signaling:peer-joined', { socketId: socket.id } as PeerJoinedDTO);
      });

      // Send existing peers to the new participant
      socket.emit('signaling:peers', { peers } as PeersDTO);
    });

    socket.on('signaling:offer', ({ to, sdp }: OfferPayload) => {
      this.io.to(to).emit('signaling:offer', { from: socket.id, sdp });
    });

    socket.on('signaling:answer', ({ to, sdp }: AnswerPayload) => {
      this.io.to(to).emit('signaling:answer', { from: socket.id, sdp });
    });

    socket.on('signaling:candidate', ({ to, candidate }: CandidatePayload) => {
      this.io.to(to).emit('signaling:candidate', { from: socket.id, candidate });
    });

    socket.on('signaling:ping', ({ to }: { to: string }) => {
      this.io.to(to).emit('signaling:pong', { from: socket.id });
    });

    socket.on('disconnect', async () => {
      if (currentRoom) {
        await this._leaveRoomUseCase.execute(currentRoom, socket.id);
        socket.to(currentRoom).emit('signaling:peer-left', { socketId: socket.id } as PeerLeftDTO);
      }
    });
  }
}