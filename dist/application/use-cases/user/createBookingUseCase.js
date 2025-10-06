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
            this._validateBookingRequest(data);
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
            if (booking.paymentMethod === Booking_1.PaymentMethod.WALLET) {
                const admin = await this._userRepository.findAdmin();
                if (!admin || !admin.id) {
                    throw new AppError_1.AppError(ErrorCode_1.ErrorCode.INTERNAL_ERROR, 'Admin user not found for wallet credit', HttpStatusCode_1.HttpStatusCode.INTERNAL_SERVER);
                }
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
    _validateBookingRequest(data) {
        const errors = [];
        const today = new Date();
        const selectedDate = new Date(`${data.date}T00:00:00`);
        if (!this._isValidDateFormat(data.date)) {
            errors.push('Invalid date format. Use YYYY-MM-DD format');
        }
        else {
            today.setHours(0, 0, 0, 0);
            selectedDate.setHours(0, 0, 0, 0);
            if (selectedDate < today) {
                errors.push('Cannot book sessions in the past');
            }
            const maxDate = new Date(today);
            maxDate.setFullYear(maxDate.getFullYear() + 1);
            if (selectedDate > maxDate) {
                errors.push('Cannot book sessions more than 12 months in advance');
            }
        }
        if (!this._isValidTimeFormat(data.startTime) || !this._isValidTimeFormat(data.endTime)) {
            errors.push('Invalid time format. Use HH:MM format');
        }
        else if (!this._isValidTimeRange(data.startTime, data.endTime)) {
            errors.push('Start time must be before end time');
        }
        if (errors.length > 0) {
            throw new AppError_1.AppError(ErrorCode_1.ErrorCode.VALIDATION_ERROR, errors.join(', '), HttpStatusCode_1.HttpStatusCode.BAD_REQUEST);
        }
    }
    _isValidTimeRange(startTime, endTime) {
        const [startHour, startMinute] = startTime.split(':').map(Number);
        const [endHour, endMinute] = endTime.split(':').map(Number);
        const startMinutes = startHour * 60 + startMinute;
        const endMinutes = endHour * 60 + endMinute;
        return startMinutes < endMinutes;
    }
    _isValidTimeFormat(time) {
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        return timeRegex.test(time);
    }
    _isValidDateFormat(date) {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(date))
            return false;
        const parsedDate = new Date(date);
        return parsedDate instanceof Date && !isNaN(parsedDate.getTime());
    }
}
exports.CreateBookingUseCase = CreateBookingUseCase;
