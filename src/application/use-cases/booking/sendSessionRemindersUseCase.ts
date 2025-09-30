import { IBookingRepository } from "../../../domain/interfaces/IBookingRepository";
import { IUserRepository } from "../../../domain/interfaces/IUserRepository";
import { IEmailService } from "../../../domain/interfaces/IEmailService";
import { Booking, BookingStatus } from "../../../domain/entities/Booking";
import { ISendSessionRemaindersService } from "../../../domain/interfaces/ISendSessionRemaindersService";
import { logger } from '../../../utils/logger';

export class SendSessionRemindersUseCase implements ISendSessionRemaindersService{
  constructor(
    private _bookingRepository: IBookingRepository,
    private _userRepository: IUserRepository,
    private _emailService: IEmailService
  ) {}

  
  async execute(now: Date = new Date()): Promise<{ processed: number }> {
    const today = this.formatDate(now); // YYYY-MM-DD

    const bookings = await this._bookingRepository.getBookingsByFilter({ status: BookingStatus.CONFIRMED, startDate: today });

    let processed = 0;

    for (const b of bookings) {
      // Skip canceled or completed
      if (b.status !== BookingStatus.CONFIRMED) continue;

      const start = this.combineDateTime(b.date, b.startTime);
      if (!start) continue;

      const minutesToStart = Math.floor((start.getTime() - now.getTime()) / 60000);

      const shouldSend15 = minutesToStart === 15 && !b.reminderEmail15Sent;
      const shouldSend5 = minutesToStart === 5 && !b.reminderEmail5Sent;

      if (!shouldSend15 && !shouldSend5) continue;

      // Fetch user and interviewer details
      const user = await this._userRepository.findUserById(b.userId);
      const interviewer = await this._userRepository.findUserById(b.interviewerId);
      if (!user || !interviewer) continue;

      const minutesLeft = shouldSend5 ? 5 : 15 as 5 | 15;

      // Send to user
      await this.safeSend(async () => {
        await this._emailService.sendSessionReminderEmail({
          to: user.email,
          recipientName: user.name,
          counterpartName: interviewer.name,
          date: b.date,
          startTime: b.startTime,
          minutesLeft,
          role: 'user',
        });
      });

      // Send to interviewer
      await this.safeSend(async () => {
        await this._emailService.sendSessionReminderEmail({
          to: interviewer.email,
          recipientName: interviewer.name,
          counterpartName: user.name,
          date: b.date,
          startTime: b.startTime,
          minutesLeft,
          role: 'interviewer',
        });
      });

      // Update flags
      await this._bookingRepository.updateReminderFlags(b.id, {
        reminderEmail15Sent: b.reminderEmail15Sent || shouldSend15,
        reminderEmail5Sent: b.reminderEmail5Sent || shouldSend5,
      });

      processed++;
    }

    return { processed };
  }

  private formatDate(d: Date) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  private combineDateTime(dateStr: string, timeStr: string): Date | null {
    // Assumes dateStr: YYYY-MM-DD, timeStr: HH:mm (24h)
    const [y, m, d] = dateStr.split('-').map(Number);
    const [hh, mm] = timeStr.split(':').map(Number);
    if ([y, m, d, hh, mm].some((n) => Number.isNaN(n))) return null;
    return new Date(y, m - 1, d, hh, mm, 0, 0);
  }

  private async safeSend(fn: () => Promise<void>) {
    try {
      await fn();
    } catch (e) {
      // Log and continue
      logger.error('[SendSessionRemindersUseCase] email send failed', { error: e });
    }
  }
}