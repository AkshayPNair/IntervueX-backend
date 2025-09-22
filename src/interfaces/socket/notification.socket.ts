import { Server } from 'socket.io'
import { NotificationGateway } from './notificationGateway'
import { setNotificationPublisher } from './notificationPublisher'

export function registerNotifications(io: Server) {
  // Initialize gateway
  const gateway = new NotificationGateway(io)
  gateway.register()

  // Bootstrap publisher singleton
  setNotificationPublisher(io)
}