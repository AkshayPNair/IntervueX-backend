"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationGateway = void 0;
class NotificationGateway {
    constructor(io) {
        this.io = io;
    }
    register() {
        this.io.on('connection', (socket) => this.handleConnection(socket));
    }
    handleConnection(socket) {
        socket.on('notify:register', ({ role, userId }) => {
            try {
                if (!role)
                    return;
                if (role === 'admin') {
                    socket.join('admin');
                    socket.emit('notify:registered', { role });
                    return;
                }
                if (!userId)
                    return;
                const room = `${role}:${userId}`;
                socket.join(room);
                socket.emit('notify:registered', { role, userId });
            }
            catch (err) {
                socket.emit('notify:error', { message: err.message });
            }
        });
        socket.on('notify:leave', ({ role, userId }) => {
            try {
                if (!role)
                    return;
                if (role === 'admin') {
                    socket.leave('admin');
                    socket.emit('notify:left', { role });
                    return;
                }
                if (!userId)
                    return;
                const room = `${role}:${userId}`;
                socket.leave(room);
                socket.emit('notify:left', { role, userId });
            }
            catch (err) {
                socket.emit('notify:error', { message: err.message });
            }
        });
    }
}
exports.NotificationGateway = NotificationGateway;
