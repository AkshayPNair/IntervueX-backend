import { BookingRepository } from "../database/repositories/bookingRepository";
import { UserRepository } from "../database/repositories/userRepository";
import { EmailService } from "../external/services/emailService";
import { SendSessionRemindersUseCase } from "../../application/use-cases/booking/sendSessionRemindersUseCase";
import { SessionReminderScheduler } from "./sessionRemainderScheduler";
import { ISendSessionRemaindersService } from "../../domain/interfaces/ISendSessionRemaindersService";

export function bootstrapSchedulers() {
  
  const _bookingRepository = new BookingRepository();
  const _userRepository = new UserRepository();
  const _emailService = new EmailService();

  const sessionRemainderScheduler: ISendSessionRemaindersService = new SendSessionRemindersUseCase(
    _bookingRepository,
    _userRepository,
    _emailService
  );

  const scheduler = new SessionReminderScheduler(sessionRemainderScheduler);
  scheduler.start();

  return scheduler;
}
