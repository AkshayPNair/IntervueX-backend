"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toPaymentHistoryDTO = exports.toPaymentStatsDTO = exports.toPaymentRecordDTO = void 0;
const toPaymentRecordDTO = (booking, interviewerName) => ({
    bookingId: booking.id,
    date: booking.createdAt.toISOString(),
    amount: booking.amount,
    paymentMethod: booking.paymentMethod,
    status: booking.status,
    interviewerName,
});
exports.toPaymentRecordDTO = toPaymentRecordDTO;
const toPaymentStatsDTO = (bookings) => ({
    totalBooked: bookings.length,
    completed: bookings.filter(b => b.status === 'completed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
});
exports.toPaymentStatsDTO = toPaymentStatsDTO;
const toPaymentHistoryDTO = (bookings, interviewerMap) => ({
    stats: (0, exports.toPaymentStatsDTO)(bookings),
    payments: bookings
        .map(b => (0, exports.toPaymentRecordDTO)(b, interviewerMap.get(b.interviewerId)))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
});
exports.toPaymentHistoryDTO = toPaymentHistoryDTO;
