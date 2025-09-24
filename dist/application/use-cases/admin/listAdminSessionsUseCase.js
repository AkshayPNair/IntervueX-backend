"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListAdminSessionsUseCase = void 0;
const bookingMapper_1 = require("../../../application/mappers/bookingMapper");
class ListAdminSessionsUseCase {
    constructor(_bookingRepository, _userRepository) {
        this._bookingRepository = _bookingRepository;
        this._userRepository = _userRepository;
    }
    async execute() {
        const bookings = await this._bookingRepository.getBookingsByFilter({});
        const userIds = Array.from(new Set(bookings.map(b => b.userId)));
        const interviewerIds = Array.from(new Set(bookings.map(b => b.interviewerId)));
        const userMap = new Map();
        for (const id of userIds) {
            const u = await this._userRepository.findUserById(id);
            userMap.set(id, u?.name || "Unknown User");
        }
        const interviewerMap = new Map();
        for (const id of interviewerIds) {
            const i = await this._userRepository.findUserById(id);
            interviewerMap.set(id, i?.name || "Interviewer");
        }
        return bookings.map(booking => (0, bookingMapper_1.toAdminBookingListDTO)(booking, userMap.get(booking.userId) || 'Unknown User', interviewerMap.get(booking.interviewerId) || "Interviewer"));
    }
}
exports.ListAdminSessionsUseCase = ListAdminSessionsUseCase;
