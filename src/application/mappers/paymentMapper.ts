import { Booking } from "../../domain/entities/Booking";
import { PaymentHistoryDTO, PaymentRecordDTO, PaymentStatsDTO } from "../../domain/dtos/payment.dto";

export const toPaymentRecordDTO = (booking: Booking,interviewerName?: string): PaymentRecordDTO => ({
  bookingId: booking.id,
  date: booking.createdAt.toISOString(),
  amount: booking.amount,
  paymentMethod: booking.paymentMethod,
  status: booking.status,
  interviewerName,
})

export const toPaymentStatsDTO = (bookings: Booking[]): PaymentStatsDTO => ({
  totalBooked: bookings.length,
  completed: bookings.filter(b => b.status === 'completed').length,
  cancelled: bookings.filter(b => b.status === 'cancelled').length,
})

export const toPaymentHistoryDTO = (bookings: Booking[],interviewerMap: Map<string, string>): PaymentHistoryDTO => ({
  stats: toPaymentStatsDTO(bookings),
  payments: bookings
    .map(b => toPaymentRecordDTO(b, interviewerMap.get(b.interviewerId)))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
})