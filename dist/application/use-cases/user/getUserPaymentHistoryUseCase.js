"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetUserPaymentHistoryUseCase = void 0;
const AppError_1 = require("../../../application/error/AppError");
const ErrorCode_1 = require("../../../application/error/ErrorCode");
const HttpStatusCode_1 = require("../../../utils/HttpStatusCode");
const paymentMapper_1 = require("../../mappers/paymentMapper");
class GetUserPaymentHistoryUseCase {
    constructor(_bookingRepository, _userRepository) {
        this._bookingRepository = _bookingRepository;
        this._userRepository = _userRepository;
    }
    async execute(userId) {
        try {
            const user = await this._userRepository.findUserById(userId);
            if (!user) {
                throw new AppError_1.AppError(ErrorCode_1.ErrorCode.NOT_FOUND, 'User not found', HttpStatusCode_1.HttpStatusCode.NOT_FOUND);
            }
            const bookings = await this._bookingRepository.getBookingsByFilter({ userId });
            const interviewerIds = Array.from(new Set(bookings.map(b => b.interviewerId)));
            const interviewerMap = new Map();
            await Promise.all(interviewerIds.map(async (id) => {
                const interviewer = await this._userRepository.findApprovedInterviewerById(id);
                if (interviewer)
                    interviewerMap.set(id, interviewer.name);
            }));
            return (0, paymentMapper_1.toPaymentHistoryDTO)(bookings, interviewerMap);
        }
        catch (error) {
            if (error instanceof AppError_1.AppError)
                throw error;
            throw new AppError_1.AppError(ErrorCode_1.ErrorCode.INTERNAL_ERROR, 'Failed to get user payment history', HttpStatusCode_1.HttpStatusCode.INTERNAL_SERVER);
        }
    }
}
exports.GetUserPaymentHistoryUseCase = GetUserPaymentHistoryUseCase;
