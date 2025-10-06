import { BookingRepository } from "../database/repositories/bookingRepository";
import { UserRepository } from "../database/repositories/userRepository";
import { EmailService } from "../external/services/emailService";
import { SendSessionRemindersUseCase } from "../../application/use-cases/booking/sendSessionRemindersUseCase";
import { SessionReminderScheduler } from "./sessionRemainderScheduler";
import { ISendSessionRemaindersService } from "../../domain/interfaces/ISendSessionRemaindersService";
import { CancelExpiredPendingBookingsUseCase } from "../../application/use-cases/user/cancelExpiredPendingBookingsUseCase";
import { CancelExpiredPendingBookingsScheduler } from "./cancelExpiredPendingBookingsScheduler";
import { ICancelExpiredPendingBookingsService } from "../../domain/interfaces/ICancelExpiredPendingBookingsService";

export function bootstrapSchedulers() {
  
  const _bookingRepository = new BookingRepository();
  const _userRepository = new UserRepository();
  const _emailService = new EmailService();

  const sessionRemainderScheduler: ISendSessionRemaindersService = new SendSessionRemindersUseCase(
    _bookingRepository,
    _userRepository,
    _emailService
  );

  const sessionScheduler = new SessionReminderScheduler(sessionRemainderScheduler);
  sessionScheduler.start();

  const cancelExpiredPendingBookingsService: ICancelExpiredPendingBookingsService = new CancelExpiredPendingBookingsUseCase(
    _bookingRepository
  );
  const cancelScheduler = new CancelExpiredPendingBookingsScheduler(cancelExpiredPendingBookingsService);
  cancelScheduler.start();

  return { sessionScheduler, cancelScheduler };
}
