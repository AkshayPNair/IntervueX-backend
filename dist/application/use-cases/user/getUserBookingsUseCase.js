"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetUserBookingsUseCase = void 0;
const AppError_1 = require("../../error/AppError");
const ErrorCode_1 = require("../../error/ErrorCode");
const HttpStatusCode_1 = require("../../../utils/HttpStatusCode");
const bookingMapper_1 = require("../../mappers/bookingMapper");
const interviewerMapper_1 = require("../../mappers/interviewerMapper");
class GetUserBookingsUseCase {
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
            const interviewerIds = [...new Set(bookings.map(booking => booking.interviewerId))];
            const interviewers = await Promise.all(interviewerIds.map(id => this._userRepository.findApprovedInterviewerById(id)));
            const interviewerMap = new Map();
            interviewers.forEach(interviewer => {
                if (interviewer) {
                    const interviewerProfileDTO = (0, interviewerMapper_1.mapRepositoryToInterviewerDTO)(interviewer);
                    interviewerMap.set(interviewer._id.toString(), interviewerProfileDTO);
                }
            });
            return bookings.map(booking => (0, bookingMapper_1.toBookingResponseDTO)(booking, interviewerMap.get(booking.interviewerId)));
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                throw error;
            }
            throw new AppError_1.AppError(ErrorCode_1.ErrorCode.INTERNAL_ERROR, 'Failed to get user bookings', HttpStatusCode_1.HttpStatusCode.INTERNAL_SERVER);
        }
    }
}
exports.GetUserBookingsUseCase = GetUserBookingsUseCase;
