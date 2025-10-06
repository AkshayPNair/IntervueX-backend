"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerifyPaymentUseCase = void 0;
const AppError_1 = require("../../../application/error/AppError");
const ErrorCode_1 = require("../../../application/error/ErrorCode");
const HttpStatusCode_1 = require("../../../utils/HttpStatusCode");
const walletMapper_1 = require("../../../application/mappers/walletMapper");
const Booking_1 = require("../../../domain/entities/Booking");
const crypto_1 = __importDefault(require("crypto"));
class VerifyPaymentUseCase {
    constructor(_bookingRepository, _userRepository, _walletRepository) {
        this._bookingRepository = _bookingRepository;
        this._userRepository = _userRepository;
        this._walletRepository = _walletRepository;
    }
    async execute(data, userId) {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = data;
        if (!process.env.RAZORPAY_KEY_SECRET) {
            throw new AppError_1.AppError(ErrorCode_1.ErrorCode.INTERNAL_ERROR, "Payment verification secret not configured", HttpStatusCode_1.HttpStatusCode.INTERNAL_SERVER);
        }
        const sign = `${razorpay_order_id}|${razorpay_payment_id}`;
        const expectedSign = crypto_1.default
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(sign)
            .digest('hex');
        if (razorpay_signature !== expectedSign) {
            throw new AppError_1.AppError(ErrorCode_1.ErrorCode.PAYMENT_ERROR, 'Payment verification failed', HttpStatusCode_1.HttpStatusCode.BAD_REQUEST);
        }
        // Get booking
        const booking = await this._bookingRepository.getBookingById(bookingId);
        if (!booking) {
            throw new AppError_1.AppError(ErrorCode_1.ErrorCode.NOT_FOUND, 'Booking not found', HttpStatusCode_1.HttpStatusCode.NOT_FOUND);
        }
        if (booking.userId !== userId) {
            throw new AppError_1.AppError(ErrorCode_1.ErrorCode.UNAUTHORIZED, "You are not allowed to verify this booking", HttpStatusCode_1.HttpStatusCode.UNAUTHORIZED);
        }
        if (booking.paymentMethod !== Booking_1.PaymentMethod.RAZORPAY) {
            throw new AppError_1.AppError(ErrorCode_1.ErrorCode.VALIDATION_ERROR, "Payment verification is only applicable for Razorpay bookings", HttpStatusCode_1.HttpStatusCode.BAD_REQUEST);
        }
        if (booking.status !== Booking_1.BookingStatus.PENDING) {
            throw new AppError_1.AppError(ErrorCode_1.ErrorCode.VALIDATION_ERROR, "Booking is not pending payment", HttpStatusCode_1.HttpStatusCode.BAD_REQUEST);
        }
        // Update booking
        await this._bookingRepository.updateBookingStatus(bookingId, Booking_1.BookingStatus.CONFIRMED);
        await this._bookingRepository.updatePaymentId(bookingId, razorpay_payment_id);
        // Get user
        const user = await this._userRepository.findUserById(booking.userId);
        if (!user) {
            throw new AppError_1.AppError(ErrorCode_1.ErrorCode.NOT_FOUND, 'User not found', HttpStatusCode_1.HttpStatusCode.NOT_FOUND);
        }
        // Wallet transactions
        const admin = await this._userRepository.findAdmin();
        if (!admin || !admin.id) {
            throw new AppError_1.AppError(ErrorCode_1.ErrorCode.INTERNAL_ERROR, 'Admin user not found for wallet credit', HttpStatusCode_1.HttpStatusCode.INTERNAL_SERVER);
        }
        // Interviewer credit
        const interviewerTnx = (0, walletMapper_1.toCreateWalletTransactionDTO)({
            userId: booking.interviewerId,
            role: 'interviewer',
            type: 'credit',
            amount: booking.amount,
            reason: 'Session Booked',
            bookingId: booking.id,
            interviewerFee: booking.interviewerAmount,
            adminFee: booking.adminFee,
            userName: user.name
        });
        await this._walletRepository.createTransaction(interviewerTnx);
        // Admin credit
        const adminTnx = (0, walletMapper_1.toCreateWalletTransactionDTO)({
            userId: admin.id,
            role: 'admin',
            type: 'credit',
            amount: booking.amount,
            reason: 'Session Booked',
            bookingId: booking.id,
            interviewerFee: booking.interviewerAmount,
            adminFee: booking.adminFee,
            userName: user.name
        });
        await this._walletRepository.createTransaction(adminTnx);
    }
}
exports.VerifyPaymentUseCase = VerifyPaymentUseCase;
