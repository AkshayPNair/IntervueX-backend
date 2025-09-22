import { Server, Socket } from 'socket.io'

export class NotificationGateway {
  constructor(private io: Server) {}

  public register() {
    this.io.on('connection', (socket: Socket) => this.handleConnection(socket))
  }

  private handleConnection(socket: Socket) {
    socket.on(
      'notify:register',
      ({ role, userId }: { role: 'user' | 'interviewer' | 'admin'; userId?: string }) => {
        try {
          if (!role) return

          if (role === 'admin') {
            socket.join('admin')
            socket.emit('notify:registered', { role })
            return
          }

          if (!userId) return

          const room = `${role}:${userId}`
          socket.join(room)
          socket.emit('notify:registered', { role, userId })
        } catch (err) {
          socket.emit('notify:error', { message: (err as Error).message })
        }
      }
    )
    
    socket.on(
      'notify:leave',
      ({ role, userId }: { role: 'user' | 'interviewer' | 'admin'; userId?: string }) => {
        try {
          if (!role) return
          if (role === 'admin') {
            socket.leave('admin')
            socket.emit('notify:left', { role })
            return
          }
          if (!userId) return
          const room = `${role}:${userId}`
          socket.leave(room)
          socket.emit('notify:left', { role, userId })
        } catch (err) {
          socket.emit('notify:error', { message: (err as Error).message })
        }
      }
    )
  }
}