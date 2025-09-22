import { IGetInterviewerDashboardService } from "../../../domain/interfaces/IGetInterviewerDashboardService";
import { IBookingRepository } from "../../../domain/interfaces/IBookingRepository";
import { IFeedbackRepository } from "../../../domain/interfaces/IFeedbackRepository";
import { IUserRepository } from "../../../domain/interfaces/IUserRepository";
import { InterviewerDashboardDTO, InterviewerDashboardStatsDTO, InterviewerUpcomingSessionDTO } from "../../../domain/dtos/dashboard.dto";
import { AppError } from "../../error/AppError";
import { ErrorCode } from "../../error/ErrorCode";
import { HttpStatusCode } from "../../../utils/HttpStatusCode";
import { Booking, BookingStatus } from "../../../domain/entities/Booking";

export class GetInterviewerDashboardUseCase implements IGetInterviewerDashboardService {
    constructor(
        private _bookingRepository: IBookingRepository,
        private _userRepository: IUserRepository,
        private _feedbackRepository: IFeedbackRepository
    ) {}

    async execute(interviewerId: string): Promise<InterviewerDashboardDTO> {
        try {
            const interviewer = await this._userRepository.findApprovedInterviewerById(interviewerId)
            if (!interviewer) {
                throw new AppError(ErrorCode.NOT_FOUND, 'Interviewer not found or not approved', HttpStatusCode.NOT_FOUND)
            }

            const bookings = await this._bookingRepository.getBookingsByFilter({ interviewerId })

            const stats: InterviewerDashboardStatsDTO = await this.computeStats(interviewerId, bookings)
            const upcomingSessions = await this.getUpcomingSessions(bookings)

            return { stats, upcomingSessions }

        } catch (error) {
            if (error instanceof AppError) throw error
            throw new AppError(ErrorCode.INTERNAL_ERROR, 'Failed to load interviewer dashboard', HttpStatusCode.INTERNAL_SERVER)
        }
    }

    private async computeStats(interviewerId: string, bookings: Booking[]): Promise<InterviewerDashboardStatsDTO> {
        const total = bookings.length
        const completed = bookings.filter(b => b.status === BookingStatus.COMPLETED).length
        const upcoming = bookings.filter(b=> b.status === BookingStatus.CONFIRMED)

        const feedbacks = await this._feedbackRepository.getFeedbacksByInterviewer(interviewerId)

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
            hoursConducted: Math.round((minutes / 60) * 10) / 10,
        }
    }

    private async getUpcomingSessions(bookings: Booking[]): Promise<InterviewerUpcomingSessionDTO[]> {
        const now = new Date()
        const upcoming = bookings.filter(b => [BookingStatus.CONFIRMED, BookingStatus.PENDING].includes(b.status))
            .filter(b => this.isFutureSession(b, now))
            .slice(0, 5)

        // Map user names for the sessions
        const userIds = Array.from(new Set(upcoming.map(b => b.userId)))
        const nameMap = new Map<string, string>()
        await Promise.all(userIds.map(async (id) => {
            const user = await this._userRepository.findUserById(id)
            if (user) nameMap.set(id, user.name)
        }))

        return upcoming.map(b => ({
            bookingId: b.id,
            userId: b.userId,
            userName: nameMap.get(b.userId) || 'Candidate',
            date: b.date,
            startTime: b.startTime,
            endTime: b.endTime,
            durationMinutes: this.diffMinutes(b.startTime, b.endTime),
        }))
    }

    private isFutureSession(b: Booking, now: Date): boolean {
        const start = new Date(`${b.date}T${b.startTime}:00Z`)
        return start.getTime() > now.getTime()
    }

    private diffMinutes(start: string, end: string): number {
        const [sh, sm] = start.split(":").map(Number)
        const [eh, em] = end.split(":").map(Number)
        return (eh * 60 + em) - (sh * 60 + sm)
    }
}