"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendSessionRemindersUseCase = void 0;
const Booking_1 = require("../../../domain/entities/Booking");
const logger_1 = require("../../../utils/logger");
class SendSessionRemindersUseCase {
    constructor(_bookingRepository, _userRepository, _emailService) {
        this._bookingRepository = _bookingRepository;
        this._userRepository = _userRepository;
        this._emailService = _emailService;
    }
    async execute(now = new Date()) {
        const today = this.formatDate(now); // YYYY-MM-DD
        const bookings = await this._bookingRepository.getBookingsByFilter({ status: Booking_1.BookingStatus.CONFIRMED, startDate: today });
        let processed = 0;
        for (const b of bookings) {
            // Skip canceled or completed
            if (b.status !== Booking_1.BookingStatus.CONFIRMED)
                continue;
            const start = this.combineDateTime(b.date, b.startTime);
            if (!start)
                continue;
            const minutesToStart = Math.floor((start.getTime() - now.getTime()) / 60000);
            let shouldSend15 = minutesToStart === 15 && !b.reminderEmail15Sent;
            let shouldSend5 = minutesToStart === 5 && !b.reminderEmail5Sent;
            if (!shouldSend15 && !shouldSend5)
                continue;
            // Fetch user and interviewer details
            const user = await this._userRepository.findUserById(b.userId);
            const interviewer = await this._userRepository.findUserById(b.interviewerId);
            if (!user || !interviewer)
                continue;
            const minutesLeft = shouldSend5 ? 5 : 15;
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
    formatDate(d) {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    }
    combineDateTime(dateStr, timeStr) {
        // Assumes dateStr: YYYY-MM-DD, timeStr: HH:mm (24h)
        const [y, m, d] = dateStr.split('-').map(Number);
        const [hh, mm] = timeStr.split(':').map(Number);
        if ([y, m, d, hh, mm].some((n) => Number.isNaN(n)))
            return null;
        return new Date(y, m - 1, d, hh, mm, 0, 0);
    }
    async safeSend(fn) {
        try {
            await fn();
        }
        catch (e) {
            // Log and continue
            logger_1.logger.error('[SendSessionRemindersUseCase] email send failed', { error: e });
        }
    }
}
exports.SendSessionRemindersUseCase = SendSessionRemindersUseCase;
