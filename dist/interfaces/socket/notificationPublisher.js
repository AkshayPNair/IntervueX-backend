"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationPublisher = exports.NotifyEvents = void 0;
exports.setNotificationPublisher = setNotificationPublisher;
let ioRef = null;
function setNotificationPublisher(io) {
    ioRef = io;
}
function ensureIO() {
    if (!ioRef) {
        throw new Error('Notification publisher not initialized');
    }
    return ioRef;
}
exports.NotifyEvents = {
    SessionBooked: 'notify:session-booked',
    FeedbackSubmitted: 'notify:feedback-submitted',
    RatingSubmitted: 'notify:rating-submitted',
    WalletCredit: 'notify:wallet-credit',
    WalletDebit: 'notify:wallet-debit',
    NewRegistration: 'notify:new-registration',
};
exports.NotificationPublisher = {
    toUser(userId, event, payload) {
        ensureIO().to(`user:${userId}`).emit(event, payload);
    },
    toInterviewer(userId, event, payload) {
        ensureIO().to(`interviewer:${userId}`).emit(event, payload);
    },
    toAdmin(event, payload) {
        ensureIO().to('admin').emit(event, payload);
    },
};
