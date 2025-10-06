import { IGetAdminDashboardService } from "../../../domain/interfaces/IGetAdminDashboardService";
import { IUserRepository } from "../../../domain/interfaces/IUserRepository";
import { IBookingRepository } from "../../../domain/interfaces/IBookingRepository";
import { IInterviewerRepository } from "../../../domain/interfaces/IInterviewerRepository";
import { AdminDashboardDTO, AdminDashboardStatsDTO, AdminRecentActivityDTO, SeriesGroupDTO } from "../../../domain/dtos/dashboard.dto";
import { AppError } from "../../error/AppError";
import { ErrorCode } from "../../error/ErrorCode";
import { HttpStatusCode } from "../../../utils/HttpStatusCode";
import { Booking, BookingStatus } from "../../../domain/entities/Booking";
import { User } from "../../../domain/entities/User";

export class GetAdminDashboardUseCase implements IGetAdminDashboardService {
  constructor(
    private _userRepository: IUserRepository,
    private _bookingRepository: IBookingRepository,
    private _interviewerRepository: IInterviewerRepository
  ) {}

  async execute(): Promise<AdminDashboardDTO> {
    try {
      const stats = await this.computeStats();
      const recentActivity = await this.getRecentActivity();
      const sessionSeries = await this.getSessionSeries();
      const usersSeries = await this.getUsersSeries();
      return { stats, recentActivity, sessionSeries, usersSeries };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(
        ErrorCode.INTERNAL_ERROR,
        "Failed to load admin dashboard",
        HttpStatusCode.INTERNAL_SERVER
      );
    }
  }

  // Compute high-level stats for the dashboard
  private async computeStats(): Promise<AdminDashboardStatsDTO> {
    // Users
    const { users: allUsers } = await this._userRepository.getAllUsers();
    const totalUsers = allUsers.length;

    // Pending interviewers (from UserRepository per project pattern)
    const pendingInterviewers = await this._userRepository.findPendingInterviewers();
    const pendingRequests = pendingInterviewers.length;

    // All bookings using existing filter method
    const allBookings = await this._bookingRepository.getBookingsByFilter({});
    const totalInterviews = allBookings.length;

    // Active sessions = confirmed bookings in the future
    const now = new Date();
    const activeSessions = allBookings.filter(
      (booking: Booking) => booking.status === BookingStatus.CONFIRMED && this.isFutureSession(booking, now)
    ).length;

    // Calculate revenue from bookings (sum adminFee of completed bookings)
    const totalCompilerRequests = 0;
    const totalRevenue = allBookings
      .filter((b: Booking) => b.status === BookingStatus.COMPLETED)
      .reduce((sum: number, b: Booking) => sum + (b.adminFee || 0), 0);

    const monthlyGrowth = await this.calculateMonthlyGrowth(allUsers, allBookings);

    return {
      totalUsers,
      activeSessions,
      pendingRequests,
      totalInterviews,
      totalCompilerRequests,
      totalRevenue,
      monthlyGrowth,
    };
  }

  // Calculate naive growth based on createdAt windows
  private async calculateMonthlyGrowth(users: User[], bookings: Booking[]) {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const recentUsers = users.filter((u) => (u.createdAt ? new Date(u.createdAt) : new Date(0)) >= thirtyDaysAgo).length;
    const previousUsers = users.filter((u) => {
      const created = u.createdAt ? new Date(u.createdAt) : new Date(0);
      return created >= sixtyDaysAgo && created < thirtyDaysAgo;
    }).length;
    const userGrowth = previousUsers > 0 ? ((recentUsers - previousUsers) / previousUsers) * 100 : 0;

    const recentBookings = bookings.filter((b: Booking) => (b.createdAt ? new Date(b.createdAt) : new Date(0)) >= thirtyDaysAgo).length;
    const previousBookings = bookings.filter((b: Booking) => {
      const created = b.createdAt ? new Date(b.createdAt) : new Date(0);
      return created >= sixtyDaysAgo && created < thirtyDaysAgo;
    }).length;
    const interviewGrowth = previousBookings > 0 ? ((recentBookings - previousBookings) / previousBookings) * 100 : 0;

    return {
      users: Math.round(userGrowth),
      interviews: Math.round(interviewGrowth),
      revenue: 0, // can be computed similarly if needed
    };
  }

  // Build recent activity from available data
  private async getRecentActivity(): Promise<AdminRecentActivityDTO[]> {
    const { users: allUsers } = await this._userRepository.getAllUsers();
    const usersSorted = [...allUsers].sort((a, b) => {
      const at = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bt = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bt - at;
    });

    const allBookings = await this._bookingRepository.getBookingsByFilter({});
    const bookingsSorted = [...allBookings].sort((a:Booking, b: Booking) => {
      const at = (a.updatedAt || a.createdAt) ? new Date(a.updatedAt || a.createdAt).getTime() : 0;
      const bt = (b.updatedAt || b.createdAt) ? new Date(b.updatedAt || b.createdAt).getTime() : 0;
      return bt - at;
    });


    const interviewerCandidates = allUsers.filter((u) => u.role === "interviewer");

    const activities: AdminRecentActivityDTO[] = [];

    usersSorted.slice(0, 10).forEach((user) => {
      activities.push({
        id: `user_${user.id}`,
        type: "user_registration",
        message: `New user registered: ${user.name}`,
        timestamp: new Date(user.createdAt || new Date()),
        userName: user.name,
      });
    });

    bookingsSorted
      .filter((b: Booking) => b.status === BookingStatus.COMPLETED)
      .slice(0, 10)
      .forEach((booking:Booking) => {
        activities.push({
          id: `booking_${booking.id}`,
          type: "booking_completed",
          message: `Interview session completed`,
          timestamp: new Date(booking.updatedAt || booking.createdAt || new Date()),
        });
      });

    interviewerCandidates
      .filter((i) => i.isApproved)
      .slice(0, 10)
      .forEach((interviewer) => {
        activities.push({
          id: `interviewer_${interviewer.id}`,
          type: "interviewer_approval",
          message: `Interviewer approved: ${interviewer.name}`,
          timestamp: new Date(interviewer.updatedAt || interviewer.createdAt || new Date()),
          interviewerName: interviewer.name,
        });
      });

    return activities
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 10);
  }

  private isFutureSession(booking:Booking, now: Date): boolean {
    try {
      const sessionDateTime = new Date(`${booking.date}T${booking.startTime}:00Z`);
      return sessionDateTime.getTime() > now.getTime();
    } catch {
      return false;
    }
  }

  // Build session series (week/month/year) from bookings
  private async getSessionSeries(): Promise<SeriesGroupDTO> {
    const all = await this._bookingRepository.getBookingsByFilter({});
    const week = this.aggregateBy("week", all.map(b => ({ date: b.date, value: 1 })));
    const month = this.aggregateBy("month", all.map(b => ({ date: b.date, value: 1 })));
    const year = this.aggregateBy("year", all.map(b => ({ date: b.date, value: 1 })));
    return { week, month, year } as SeriesGroupDTO;
  }

  // Build users series (week/month/year) from users
  private async getUsersSeries(): Promise<SeriesGroupDTO> {
    const { users } = await this._userRepository.getAllUsers();
    const week = this.aggregateBy(
      "week",
      users.map(u => ({
        // Normalize to string (YYYY-MM-DD)
        date: (u.createdAt ? new Date(u.createdAt).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10)),
        value: 1,
      }))
    );
    const month = this.aggregateBy(
      "month",
      users.map(u => ({
        date: (u.createdAt ? new Date(u.createdAt).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10)),
        value: 1,
      }))
    );
    const year = this.aggregateBy(
      "year",
      users.map(u => ({
        date: (u.createdAt ? new Date(u.createdAt).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10)),
        value: 1,
      }))
    );
    return { week, month, year } as SeriesGroupDTO;
  }

  // Helper: aggregate items by period into {name,value} series
  private aggregateBy(period: "week" | "month" | "year", items: { date: string; value: number }[]) {
    const now = new Date();
    const result: { [key: string]: number } = {};

    const push = (key: string, val: number) => {
      result[key] = (result[key] || 0) + val;
    };

    items.forEach(({ date, value }) => {
      const d = new Date(date);
      if (period === "week") {
        const diff = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
        if (diff <= 6) {
          const day = d.toLocaleDateString(undefined, { weekday: "short" });
          push(day, value);
        }
      } else if (period === "month") {
        if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) {
          const weekNum = Math.ceil(d.getDate() / 7);
          push(`Week ${weekNum}`, value);
        }
      } else {
        if (d.getFullYear() === now.getFullYear()) {
          const mon = d.toLocaleDateString(undefined, { month: "short" });
          push(mon, value);
        }
      }
    });

    // Convert to [{name,value}] and ensure consistent order
    const order = period === "week"
      ? ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]
      : period === "month"
        ? ["Week 1","Week 2","Week 3","Week 4","Week 5"]
        : ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

    return order.map(name => ({ name, value: result[name] || 0 }));
  }
}

