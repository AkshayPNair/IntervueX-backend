import { INotificationPublisher } from '../../domain/interfaces/INotificationPublisher'
import {Server} from 'socket.io'

let ioRef:Server | null = null

export function setNotificationPublisher(io:Server){
    ioRef = io
}

function ensureIO():Server{
    if(!ioRef){
        throw new Error('Notification publisher not initialized')
    }
    return ioRef
}

export const NotifyEvents = {
  SessionBooked: 'notify:session-booked',
  FeedbackSubmitted: 'notify:feedback-submitted',
  RatingSubmitted: 'notify:rating-submitted',
  WalletCredit: 'notify:wallet-credit',
  WalletDebit: 'notify:wallet-debit',
  NewRegistration: 'notify:new-registration',
} as const

export type NotifyEventName = typeof NotifyEvents[keyof typeof NotifyEvents]

type Payload = Record<string, unknown>

export const NotificationPublisher:INotificationPublisher={
    toUser(userId:string, event:NotifyEventName, payload:Payload) {
        ensureIO().to(`user:${userId}`).emit(event, payload)
    },
    toInterviewer(userId:string, event:NotifyEventName, payload: Payload){
        ensureIO().to(`interviewer:${userId}`).emit(event, payload)
    },
    toAdmin(event:NotifyEventName, payload:Payload) {
        ensureIO().to('admin').emit(event, payload)
    },
}