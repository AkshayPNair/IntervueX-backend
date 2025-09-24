"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetInterviewerDashboardUseCase = void 0;
const AppError_1 = require("../../error/AppError");
const ErrorCode_1 = require("../../error/ErrorCode");
const HttpStatusCode_1 = require("../../../utils/HttpStatusCode");
const Booking_1 = require("../../../domain/entities/Booking");
class GetInterviewerDashboardUseCase {
    constructor(_bookingRepository, _userRepository, _feedbackRepository) {
        this._bookingRepository = _bookingRepository;
        this._userRepository = _userRepository;
        this._feedbackRepository = _feedbackRepository;
    }
    async execute(interviewerId) {
        try {
            const interviewer = await this._userRepository.findApprovedInterviewerById(interviewerId);
            if (!interviewer) {
                throw new AppError_1.AppError(ErrorCode_1.ErrorCode.NOT_FOUND, 'Interviewer not found or not approved', HttpStatusCode_1.HttpStatusCode.NOT_FOUND);
            }
            const bookings = await this._bookingRepository.getBookingsByFilter({ interviewerId });
            const stats = await this.computeStats(interviewerId, bookings);
            const upcomingSessions = await this.getUpcomingSessions(bookings);
            return { stats, upcomingSessions };
        }
        catch (error) {
            if (error instanceof AppError_1.AppError)
                throw error;
            throw new AppError_1.AppError(ErrorCode_1.ErrorCode.INTERNAL_ERROR, 'Failed to load interviewer dashboard', HttpStatusCode_1.HttpStatusCode.INTERNAL_SERVER);
        }
    }
    async computeStats(interviewerId, bookings) {
        const total = bookings.length;
        const completed = bookings.filter(b => b.status === Booking_1.BookingStatus.COMPLETED).length;
        const upcoming = bookings.filter(b => b.status === Booking_1.BookingStatus.CONFIRMED);
        const feedbacks = await this._feedbackRepository.getFeedbacksByInterviewer(interviewerId);
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
            hoursConducted: Math.round((minutes / 60) * 10) / 10,
        };
    }
    async getUpcomingSessions(bookings) {
        const now = new Date();
        const upcoming = bookings.filter(b => [Booking_1.BookingStatus.CONFIRMED, Booking_1.BookingStatus.PENDING].includes(b.status))
            .filter(b => this.isFutureSession(b, now))
            .slice(0, 5);
        // Map user names for the sessions
        const userIds = Array.from(new Set(upcoming.map(b => b.userId)));
        const nameMap = new Map();
        await Promise.all(userIds.map(async (id) => {
            const user = await this._userRepository.findUserById(id);
            if (user)
                nameMap.set(id, user.name);
        }));
        return upcoming.map(b => ({
            bookingId: b.id,
            userId: b.userId,
            userName: nameMap.get(b.userId) || 'Candidate',
            date: b.date,
            startTime: b.startTime,
            endTime: b.endTime,
            durationMinutes: this.diffMinutes(b.startTime, b.endTime),
        }));
    }
    isFutureSession(b, now) {
        const start = new Date(`${b.date}T${b.startTime}:00Z`);
        return start.getTime() > now.getTime();
    }
    diffMinutes(start, end) {
        const [sh, sm] = start.split(":").map(Number);
        const [eh, em] = end.split(":").map(Number);
        return (eh * 60 + em) - (sh * 60 + sm);
    }
}
exports.GetInterviewerDashboardUseCase = GetInterviewerDashboardUseCase;
