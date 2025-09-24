"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bootstrapSchedulers = bootstrapSchedulers;
const bookingRepository_1 = require("../database/repositories/bookingRepository");
const userRepository_1 = require("../database/repositories/userRepository");
const emailService_1 = require("../external/services/emailService");
const sendSessionRemindersUseCase_1 = require("../../application/use-cases/booking/sendSessionRemindersUseCase");
const sessionRemainderScheduler_1 = require("./sessionRemainderScheduler");
function bootstrapSchedulers() {
    const _bookingRepository = new bookingRepository_1.BookingRepository();
    const _userRepository = new userRepository_1.UserRepository();
    const _emailService = new emailService_1.EmailService();
    const sessionRemainderScheduler = new sendSessionRemindersUseCase_1.SendSessionRemindersUseCase(_bookingRepository, _userRepository, _emailService);
    const scheduler = new sessionRemainderScheduler_1.SessionReminderScheduler(sessionRemainderScheduler);
    scheduler.start();
    return scheduler;
}
