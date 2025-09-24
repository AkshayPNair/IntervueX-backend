"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompleteBookingUseCase = void 0;
const AppError_1 = require("../../error/AppError");
const ErrorCode_1 = require("../../error/ErrorCode");
const HttpStatusCode_1 = require("../../../utils/HttpStatusCode");
const Booking_1 = require("../../../domain/entities/Booking");
class CompleteBookingUseCase {
    constructor(_bookingRepository) {
        this._bookingRepository = _bookingRepository;
    }
    async execute(userId, data) {
        const booking = await this._bookingRepository.getBookingById(data.bookingId);
        if (!booking) {
            throw new AppError_1.AppError(ErrorCode_1.ErrorCode.NOT_FOUND, "Booking not found", HttpStatusCode_1.HttpStatusCode.NOT_FOUND);
        }
        const isParticipant = booking.userId === userId || booking.interviewerId === userId;
        if (!isParticipant) {
            throw new AppError_1.AppError(ErrorCode_1.ErrorCode.FORBIDDEN, "You are not allowed to complete this booking", HttpStatusCode_1.HttpStatusCode.FORBIDDEN);
        }
        if (booking.status === Booking_1.BookingStatus.CANCELLED) {
            throw new AppError_1.AppError(ErrorCode_1.ErrorCode.VALIDATION_ERROR, "Cannot complete a cancelled booking", HttpStatusCode_1.HttpStatusCode.BAD_REQUEST);
        }
        // Idempotent: if already completed, do nothing
        if (booking.status === Booking_1.BookingStatus.COMPLETED)
            return;
        const updated = await this._bookingRepository.completeBooking(data.bookingId);
        if (!updated) {
            throw new AppError_1.AppError(ErrorCode_1.ErrorCode.DATABASE_ERROR, "Failed to update booking status", HttpStatusCode_1.HttpStatusCode.INTERNAL_SERVER);
        }
    }
}
exports.CompleteBookingUseCase = CompleteBookingUseCase;
