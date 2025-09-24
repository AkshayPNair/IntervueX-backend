"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateBookingUseCase = void 0;
const AppError_1 = require("../../../application/error/AppError");
const ErrorCode_1 = require("../../../application/error/ErrorCode");
const HttpStatusCode_1 = require("../../../utils/HttpStatusCode");
const bookingMapper_1 = require("../../../application/mappers/bookingMapper");
const interviewerMapper_1 = require("../../../application/mappers/interviewerMapper");
const walletMapper_1 = require("../../../application/mappers/walletMapper");
const Booking_1 = require("../../../domain/entities/Booking");
class CreateBookingUseCase {
    constructor(_bookingRepository, _userRepository, _walletRepository) {
        this._bookingRepository = _bookingRepository;
        this._userRepository = _userRepository;
        this._walletRepository = _walletRepository;
    }
    async execute(userId, data) {
        try {
            const user = await this._userRepository.findUserById(userId);
            if (!user) {
                throw new AppError_1.AppError(ErrorCode_1.ErrorCode.NOT_FOUND, 'User not found', HttpStatusCode_1.HttpStatusCode.NOT_FOUND);
            }
            const interviewer = await this._userRepository.findApprovedInterviewerById(data.interviewerId);
            if (!interviewer) {
                throw new AppError_1.AppError(ErrorCode_1.ErrorCode.NOT_FOUND, 'Interviewer not found', HttpStatusCode_1.HttpStatusCode.NOT_FOUND);
            }
            const isAvailable = await this._bookingRepository.checkSlotAvailability(data.interviewerId, data.date, data.startTime, data.endTime);
            if (!isAvailable) {
                throw new AppError_1.AppError(ErrorCode_1.ErrorCode.VALIDATION_ERROR, 'This slot is no longer available', HttpStatusCode_1.HttpStatusCode.BAD_REQUEST);
            }
            const interviewerDTO = (0, interviewerMapper_1.mapRepositoryToInterviewerDTO)(interviewer);
            if (data.paymentMethod === Booking_1.PaymentMethod.WALLET) {
                const userWallet = await this._walletRepository.getOrCreateWallet(userId, 'user');
                if (userWallet.balance < data.amount) {
                    throw new AppError_1.AppError(ErrorCode_1.ErrorCode.PAYMENT_ERROR, 'Insufficient wallet balance', HttpStatusCode_1.HttpStatusCode.BAD_REQUEST);
                }
            }
            const booking = await this._bookingRepository.createBooking(userId, data);
            if (booking.paymentMethod === Booking_1.PaymentMethod.RAZORPAY || booking.paymentMethod === Booking_1.PaymentMethod.WALLET) {
                const admin = await this._userRepository.findAdmin();
                if (!admin || !admin.id) {
                    throw new AppError_1.AppError(ErrorCode_1.ErrorCode.INTERNAL_ERROR, 'Admin user not found for wallet credit', HttpStatusCode_1.HttpStatusCode.INTERNAL_SERVER);
                }
                if (booking.paymentMethod === Booking_1.PaymentMethod.WALLET) {
                    const userTnx = (0, walletMapper_1.toCreateWalletTransactionDTO)({
                        userId: booking.userId,
                        role: 'user',
                        type: 'debit',
                        amount: booking.amount,
                        reason: 'Session Booked',
                        bookingId: booking.id,
                        userName: user.name
                    });
                    await this._walletRepository.createTransaction(userTnx);
                }
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
            return (0, bookingMapper_1.toBookingResponseDTO)(booking, interviewerDTO);
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                throw error;
            }
            throw new AppError_1.AppError(ErrorCode_1.ErrorCode.INTERNAL_ERROR, 'Failed to create booking', HttpStatusCode_1.HttpStatusCode.INTERNAL_SERVER);
        }
    }
}
exports.CreateBookingUseCase = CreateBookingUseCase;
