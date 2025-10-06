"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bootstrapSchedulers = bootstrapSchedulers;
const bookingRepository_1 = require("../database/repositories/bookingRepository");
const userRepository_1 = require("../database/repositories/userRepository");
const emailService_1 = require("../external/services/emailService");
const sendSessionRemindersUseCase_1 = require("../../application/use-cases/booking/sendSessionRemindersUseCase");
const sessionRemainderScheduler_1 = require("./sessionRemainderScheduler");
const cancelExpiredPendingBookingsUseCase_1 = require("../../application/use-cases/user/cancelExpiredPendingBookingsUseCase");
const cancelExpiredPendingBookingsScheduler_1 = require("./cancelExpiredPendingBookingsScheduler");
function bootstrapSchedulers() {
    const _bookingRepository = new bookingRepository_1.BookingRepository();
    const _userRepository = new userRepository_1.UserRepository();
    const _emailService = new emailService_1.EmailService();
    const sessionRemainderScheduler = new sendSessionRemindersUseCase_1.SendSessionRemindersUseCase(_bookingRepository, _userRepository, _emailService);
    const sessionScheduler = new sessionRemainderScheduler_1.SessionReminderScheduler(sessionRemainderScheduler);
    sessionScheduler.start();
    const cancelExpiredPendingBookingsService = new cancelExpiredPendingBookingsUseCase_1.CancelExpiredPendingBookingsUseCase(_bookingRepository);
    const cancelScheduler = new cancelExpiredPendingBookingsScheduler_1.CancelExpiredPendingBookingsScheduler(cancelExpiredPendingBookingsService);
    cancelScheduler.start();
    return { sessionScheduler, cancelScheduler };
}
