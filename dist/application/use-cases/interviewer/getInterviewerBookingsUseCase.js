"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetInterviewerBookingsUseCase = void 0;
const AppError_1 = require("../../error/AppError");
const ErrorCode_1 = require("../../error/ErrorCode");
const HttpStatusCode_1 = require("../../../utils/HttpStatusCode");
const bookingMapper_1 = require("../../mappers/bookingMapper");
const userMapper_1 = require("../../../application/mappers/userMapper");
class GetInterviewerBookingsUseCase {
    constructor(_bookingRepository, _userRepository) {
        this._bookingRepository = _bookingRepository;
        this._userRepository = _userRepository;
    }
    async execute(interviewerId, search) {
        try {
            const interviewer = await this._userRepository.findApprovedInterviewerById(interviewerId);
            if (!interviewer) {
                throw new AppError_1.AppError(ErrorCode_1.ErrorCode.NOT_FOUND, 'Interviewer not found', HttpStatusCode_1.HttpStatusCode.NOT_FOUND);
            }
            const bookings = await this._bookingRepository.getBookingsByFilter({ interviewerId });
            const userIds = [...new Set(bookings.map(booking => booking.userId))];
            const users = await Promise.all(userIds.map(id => this._userRepository.findUserById(id)));
            const userMap = new Map();
            users.forEach(user => {
                if (user) {
                    userMap.set(user.id, (0, userMapper_1.toUserProfileDTO)(user));
                }
            });
            let filteredBookings = bookings.map(booking => (0, bookingMapper_1.toInterviewerBookingResponseDTO)(booking, userMap.get(booking.userId)));
            if (search && search.trim()) {
                const searchLower = search.toLowerCase().trim();
                filteredBookings = filteredBookings.filter(booking => booking.userName.toLowerCase().includes(searchLower) ||
                    booking.userEmail.toLowerCase().includes(searchLower));
            }
            return filteredBookings;
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                throw error;
            }
            throw new AppError_1.AppError(ErrorCode_1.ErrorCode.INTERNAL_ERROR, 'Failed to get interviewer bookings', HttpStatusCode_1.HttpStatusCode.INTERNAL_SERVER);
        }
    }
}
exports.GetInterviewerBookingsUseCase = GetInterviewerBookingsUseCase;
