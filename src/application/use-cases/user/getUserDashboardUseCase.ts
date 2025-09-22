import { IGetUserDashboardService } from "../../../domain/interfaces/IGetUserDashboardService";
import { IBookingRepository } from "../../../domain/interfaces/IBookingRepository";
import { IFeedbackRepository } from "../../../domain/interfaces/IFeedbackRepository";
import { IUserRepository } from "../../../domain/interfaces/IUserRepository";
import { UserDashboardDTO, UserDashboardStatsDTO, UpcomingSessionDTO } from "../../../domain/dtos/dashboard.dto";
import { AppError } from "../../error/AppError";
import { ErrorCode } from "../../error/ErrorCode";
import { HttpStatusCode } from "../../../utils/HttpStatusCode";
import { Booking, BookingStatus } from "../../../domain/entities/Booking";

export class GetUserDashboardUseCase implements IGetUserDashboardService {
    constructor(
        private _bookingRepository: IBookingRepository,
        private _userRepository: IUserRepository,
        private _feedbackRepository: IFeedbackRepository
    ) { }

    async execute(userId: string): Promise<UserDashboardDTO> {
        try {
            const user = await this._userRepository.findUserById(userId)
            if (!user) {
                throw new AppError(ErrorCode.NOT_FOUND, 'User not found', HttpStatusCode.NOT_FOUND)
            }

            const bookings = await this._bookingRepository.getBookingsByFilter({ userId })

            const stats: UserDashboardStatsDTO = await this.computeStats(userId, bookings)
            const upcomingSessions = await this.getUpcomingSessions(bookings)

            return { stats, upcomingSessions }

        } catch (error) {
            if (error instanceof AppError) throw error
            throw new AppError(ErrorCode.INTERNAL_ERROR, 'Failed to load dashboard', HttpStatusCode.INTERNAL_SERVER)
        }
    }

    private async computeStats(userId: string, bookings: Booking[]): Promise<UserDashboardStatsDTO> {
        const total = bookings.length
        const completed = bookings.filter(b => b.status === BookingStatus.COMPLETED).length

        const feedbacks = await this._feedbackRepository.getFeedbacksByUser(userId)

        const averageRating = feedbacks.length
            ? Math.round((feedbacks.reduce((sum, f) => sum + (f.overallRating || 0), 0) / feedbacks.length) * 10) / 10
            : 0

        const minutes = bookings
            .filter(b => b.status === BookingStatus.COMPLETED)
            .map(b => this.diffMinutes(b.startTime, b.endTime))
            .reduce((a, b) => a + b, 0)

        return {
            totalInterviews: total,
            averageRating,
            successRate: total > 0 ? Math.round((completed / total) * 100) : 0,
            hoursPracticed: Math.round((minutes / 60) * 10) / 10,
        }
    }

    private async getUpcomingSessions(bookings: Booking[]): Promise<UpcomingSessionDTO[]> {
        const now = new Date()
        // Treat bookings with status confirmed or pending and date/time in future as upcoming
        const upcoming = bookings.filter(b => [BookingStatus.CONFIRMED, BookingStatus.PENDING].includes(b.status))
            .filter(b => this.isFutureSession(b, now))
            .slice(0, 5)

        // Map interviewer names
        const interviewerIds = Array.from(new Set(upcoming.map(b => b.interviewerId)))
        const map = new Map<string, string>()
        await Promise.all(interviewerIds.map(async (id) => {
            const interviewer = await this._userRepository.findApprovedInterviewerById(id)
            if (interviewer) map.set(id, interviewer.name)
        }))

        return upcoming.map(b => ({
            bookingId: b.id,
            interviewerId: b.interviewerId,
            interviewerName: map.get(b.interviewerId) || 'Interviewer',
            date: b.date,
            startTime: b.startTime,
            endTime: b.endTime,
            durationMinutes: this.diffMinutes(b.startTime, b.endTime),
        }))
    }

    private isFutureSession(b: Booking, now: Date): boolean {
        // Combine date and time into a Date object (assuming date is YYYY-MM-DD and time is HH:MM 24h)
        const start = new Date(`${b.date}T${b.startTime}:00Z`)
        return start.getTime() > now.getTime()
    }

    private diffMinutes(start: string, end: string): number {
        const [sh, sm] = start.split(":").map(Number)
        const [eh, em] = end.split(":").map(Number)
        return (eh * 60 + em) - (sh * 60 + sm)
    }

}