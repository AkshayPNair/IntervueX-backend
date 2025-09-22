export interface UserDashboardStatsDTO {
    totalInterviews: number
    averageRating: number
    successRate: number
    hoursPracticed: number
}

export interface UpcomingSessionDTO {
    bookingId: string
    interviewerId: string
    interviewerName: string
    date: string
    startTime: string
    endTime: string
    durationMinutes: number
}

export interface UserDashboardDTO {
    stats: UserDashboardStatsDTO
    upcomingSessions: UpcomingSessionDTO[]
}

export interface InterviewerDashboardStatsDTO {
    totalInterviews: number
    averageRating: number
    successRate: number
    hoursConducted: number
}

export interface InterviewerUpcomingSessionDTO {
    bookingId: string
    userId: string
    userName: string
    date: string
    startTime: string
    endTime: string
    durationMinutes: number
}

export interface InterviewerDashboardDTO {
    stats: InterviewerDashboardStatsDTO
    upcomingSessions: InterviewerUpcomingSessionDTO[]
}

export interface AdminDashboardStatsDTO {
    totalUsers: number
    activeSessions: number
    pendingRequests: number
    totalInterviews: number
    totalCompilerRequests: number
    totalRevenue: number
    monthlyGrowth: {
        users: number
        interviews: number
        revenue: number
    }
}

export interface AdminRecentActivityDTO {
    id: string
    type: 'user_registration' | 'interviewer_approval' | 'booking_completed' | 'feedback_submitted' | 'payment_received'
    message: string
    timestamp: Date
    userName?: string
    interviewerName?: string
}

export interface SeriesPointDTO {
    name: string
    value: number
}

export interface SeriesGroupDTO {
    week: SeriesPointDTO[]
    month: SeriesPointDTO[]
    year: SeriesPointDTO[]
}

export interface AdminDashboardDTO {
    stats: AdminDashboardStatsDTO
    recentActivity: AdminRecentActivityDTO[]
    sessionSeries: SeriesGroupDTO
    usersSeries: SeriesGroupDTO
}