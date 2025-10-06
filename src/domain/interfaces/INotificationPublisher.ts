export type NotifyEventName =
    | 'notify:session-booked'
    | 'notify:feedback-submitted'
    | 'notify:rating-submitted'
    | 'notify:wallet-credit'
    | 'notify:wallet-debit'
    | 'notify:new-registration'
    | 'notify:user-blocked'
    | 'notify:user-unblocked'

export type Payload = Record<string, unknown>

export interface INotificationPublisher {
    toUser(userId: string, event: NotifyEventName, payload: Payload):void
    toInterviewer(interviewerId: string, event: NotifyEventName, payload: Payload):void
    toAdmin(event: NotifyEventName, payload: Payload):void
}