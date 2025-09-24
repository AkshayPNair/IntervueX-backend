"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CancelBookingUseCase = void 0;
const AppError_1 = require("../../../application/error/AppError");
const ErrorCode_1 = require("../../../application/error/ErrorCode");
const HttpStatusCode_1 = require("../../../utils/HttpStatusCode");
const Booking_1 = require("../../../domain/entities/Booking");
const walletMapper_1 = require("../../../application/mappers/walletMapper");
class CancelBookingUseCase {
    constructor(_bookingRepository, _userRepository, _walletRepository) {
        this._bookingRepository = _bookingRepository;
        this._userRepository = _userRepository;
        this._walletRepository = _walletRepository;
    }
    async execute(userId, data) {
        try {
            const booking = await this._bookingRepository.getBookingById(data.bookingId);
            if (!booking) {
                throw new AppError_1.AppError(ErrorCode_1.ErrorCode.NOT_FOUND, "Booking not found", HttpStatusCode_1.HttpStatusCode.NOT_FOUND);
            }
            if (booking.userId !== userId) {
                throw new AppError_1.AppError(ErrorCode_1.ErrorCode.FORBIDDEN, 'You can only cancel your own bookings', HttpStatusCode_1.HttpStatusCode.FORBIDDEN);
            }
            if (booking.status === Booking_1.BookingStatus.CANCELLED) {
                throw new AppError_1.AppError(ErrorCode_1.ErrorCode.VALIDATION_ERROR, 'Booking is already cancelled', HttpStatusCode_1.HttpStatusCode.BAD_REQUEST);
            }
            if (booking.status === Booking_1.BookingStatus.COMPLETED) {
                throw new AppError_1.AppError(ErrorCode_1.ErrorCode.VALIDATION_ERROR, 'Cannot cancel a completed booking', HttpStatusCode_1.HttpStatusCode.BAD_REQUEST);
            }
            const [user, admin] = await Promise.all([
                this._userRepository.findUserById(booking.userId),
                this._userRepository.findAdmin()
            ]);
            if (!user) {
                throw new AppError_1.AppError(ErrorCode_1.ErrorCode.INTERNAL_ERROR, 'User not found for wallet refund', HttpStatusCode_1.HttpStatusCode.INTERNAL_SERVER);
            }
            if (!admin || !admin.id) {
                throw new AppError_1.AppError(ErrorCode_1.ErrorCode.INTERNAL_ERROR, 'Admin user not founf for wallet adjustment', HttpStatusCode_1.HttpStatusCode.INTERNAL_SERVER);
            }
            const amount = booking.amount;
            const interviewerAmount = booking.interviewerAmount;
            const adminFee = booking.adminFee;
            const userCedit = (0, walletMapper_1.toCreateWalletTransactionDTO)({
                userId: booking.userId,
                role: 'user',
                type: 'credit',
                amount,
                reason: 'Refund Processed',
                bookingId: booking.id,
                userName: user.name
            });
            const interviewerDebit = (0, walletMapper_1.toCreateWalletTransactionDTO)({
                userId: booking.interviewerId,
                role: 'interviewer',
                type: 'debit',
                amount: interviewerAmount,
                reason: 'Session Cancelled',
                bookingId: booking.id,
                userName: user.name,
            });
            const adminDebit = (0, walletMapper_1.toCreateWalletTransactionDTO)({
                userId: admin.id,
                role: 'admin',
                type: 'debit',
                amount: adminFee,
                reason: 'Session Cancelled',
                bookingId: booking.id,
                userName: user.name
            });
            const bookingDateTime = new Date(`${booking.date}T${booking.startTime}`);
            const now = new Date();
            const timeDifference = bookingDateTime.getTime() - now.getTime();
            const hoursUntilBooking = timeDifference / (1000 * 60 * 60);
            if (hoursUntilBooking < 24) {
                throw new AppError_1.AppError(ErrorCode_1.ErrorCode.VALIDATION_ERROR, 'Cannot cancel booking less than 24 hours before the scheduled time', HttpStatusCode_1.HttpStatusCode.BAD_REQUEST);
            }
            await Promise.all([
                this._walletRepository.createTransaction(userCedit),
                this._walletRepository.createTransaction(interviewerDebit),
                this._walletRepository.createTransaction(adminDebit)
            ]);
            const cancelledBooking = await this._bookingRepository.cancelBooking(data.bookingId, data.reason);
            if (!cancelledBooking) {
                throw new AppError_1.AppError(ErrorCode_1.ErrorCode.DATABASE_ERROR, 'Failed to cancel booking', HttpStatusCode_1.HttpStatusCode.INTERNAL_SERVER);
            }
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                throw error;
            }
            throw new AppError_1.AppError(ErrorCode_1.ErrorCode.UNKNOWN_ERROR, 'An unexpected error occurred while cancelling booking', HttpStatusCode_1.HttpStatusCode.INTERNAL_SERVER);
        }
    }
}
exports.CancelBookingUseCase = CancelBookingUseCase;
