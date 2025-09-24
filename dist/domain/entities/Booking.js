"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Booking = exports.PaymentMethod = exports.BookingStatus = void 0;
var BookingStatus;
(function (BookingStatus) {
    BookingStatus["PENDING"] = "pending";
    BookingStatus["CONFIRMED"] = "confirmed";
    BookingStatus["COMPLETED"] = "completed";
    BookingStatus["CANCELLED"] = "cancelled";
})(BookingStatus || (exports.BookingStatus = BookingStatus = {}));
var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod["WALLET"] = "wallet";
    PaymentMethod["RAZORPAY"] = "razorpay";
})(PaymentMethod || (exports.PaymentMethod = PaymentMethod = {}));
class Booking {
    constructor(id, userId, interviewerId, date, startTime, endTime, amount, adminFee, interviewerAmount, status, paymentMethod, paymentId, cancelReason, reminderEmail15Sent = false, reminderEmail5Sent = false, createdAt = new Date(), updatedAt = new Date()) {
        this.id = id;
        this.userId = userId;
        this.interviewerId = interviewerId;
        this.date = date;
        this.startTime = startTime;
        this.endTime = endTime;
        this.amount = amount;
        this.adminFee = adminFee;
        this.interviewerAmount = interviewerAmount;
        this.status = status;
        this.paymentMethod = paymentMethod;
        this.paymentId = paymentId;
        this.cancelReason = cancelReason;
        this.reminderEmail15Sent = reminderEmail15Sent;
        this.reminderEmail5Sent = reminderEmail5Sent;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}
exports.Booking = Booking;
