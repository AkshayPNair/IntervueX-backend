"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetUserDashboardUseCase = void 0;
const AppError_1 = require("../../error/AppError");
const ErrorCode_1 = require("../../error/ErrorCode");
const HttpStatusCode_1 = require("../../../utils/HttpStatusCode");
const Booking_1 = require("../../../domain/entities/Booking");
class GetUserDashboardUseCase {
    constructor(_bookingRepository, _userRepository, _feedbackRepository) {
        this._bookingRepository = _bookingRepository;
        this._userRepository = _userRepository;
        this._feedbackRepository = _feedbackRepository;
    }
    async execute(userId) {
        try {
            const user = await this._userRepository.findUserById(userId);
            if (!user) {
                throw new AppError_1.AppError(ErrorCode_1.ErrorCode.NOT_FOUND, 'User not found', HttpStatusCode_1.HttpStatusCode.NOT_FOUND);
            }
            const bookings = await this._bookingRepository.getBookingsByFilter({ userId });
            const stats = await this.computeStats(userId, bookings);
            const upcomingSessions = await this.getUpcomingSessions(bookings);
            return { stats, upcomingSessions };
        }
        catch (error) {
            if (error instanceof AppError_1.AppError)
                throw error;
            throw new AppError_1.AppError(ErrorCode_1.ErrorCode.INTERNAL_ERROR, 'Failed to load dashboard', HttpStatusCode_1.HttpStatusCode.INTERNAL_SERVER);
        }
    }
    async computeStats(userId, bookings) {
        const total = bookings.length;
        const completed = bookings.filter(b => b.status === Booking_1.BookingStatus.COMPLETED).length;
        const feedbacks = await this._feedbackRepository.getFeedbacksByUser(userId);
        const averageRating = feedbacks.length
            ? Math.round((feedbacks.reduce((sum, f) => sum + (f.overallRating || 0), 0) / feedbacks.length) * 10) / 10
            : 0;
        const minutes = bookings
            .filter(b => b.status === Booking_1.BookingStatus.COMPLETED)
            .map(b => this.diffMinutes(b.startTime, b.endTime))
            .reduce((a, b) => a + b, 0);
        return {
            totalInterviews: total,
            averageRating,
            successRate: total > 0 ? Math.round((completed / total) * 100) : 0,
            hoursPracticed: Math.round((minutes / 60) * 10) / 10,
        };
    }
    async getUpcomingSessions(bookings) {
        const now = new Date();
        // Treat bookings with status confirmed or pending and date/time in future as upcoming
        const upcoming = bookings.filter(b => [Booking_1.BookingStatus.CONFIRMED, Booking_1.BookingStatus.PENDING].includes(b.status))
            .filter(b => this.isFutureSession(b, now))
            .slice(0, 5);
        // Map interviewer names
        const interviewerIds = Array.from(new Set(upcoming.map(b => b.interviewerId)));
        const map = new Map();
        await Promise.all(interviewerIds.map(async (id) => {
            const interviewer = await this._userRepository.findApprovedInterviewerById(id);
            if (interviewer)
                map.set(id, interviewer.name);
        }));
        return upcoming.map(b => ({
            bookingId: b.id,
            interviewerId: b.interviewerId,
            interviewerName: map.get(b.interviewerId) || 'Interviewer',
            date: b.date,
            startTime: b.startTime,
            endTime: b.endTime,
            durationMinutes: this.diffMinutes(b.startTime, b.endTime),
        }));
    }
    isFutureSession(b, now) {
        // Combine date and time into a Date object (assuming date is YYYY-MM-DD and time is HH:MM 24h)
        const start = new Date(`${b.date}T${b.startTime}:00Z`);
        return start.getTime() > now.getTime();
    }
    diffMinutes(start, end) {
        const [sh, sm] = start.split(":").map(Number);
        const [eh, em] = end.split(":").map(Number);
        return (eh * 60 + em) - (sh * 60 + sm);
    }
}
exports.GetUserDashboardUseCase = GetUserDashboardUseCase;
