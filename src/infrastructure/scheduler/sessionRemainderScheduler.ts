import { ISendSessionRemaindersService } from "../../domain/interfaces/ISendSessionRemaindersService";
import { logger } from '../../utils/logger';

export class SessionReminderScheduler {
  private intervalId: ReturnType<typeof setInterval> | null = null;

  constructor(private _sendSessionRemindersService: ISendSessionRemaindersService) {}

  start() {
    this.tick(); // run immediately
    this.intervalId = setInterval(() => this.tick(), 60 * 1000); // every minute
    logger.info('[SessionReminderScheduler] started');
  }

  stop() {
    if (this.intervalId) clearInterval(this.intervalId);
    this.intervalId = null;
    logger.info('[SessionReminderScheduler] stopped');
  }

  private async tick() {
    try {
      const { processed } = await this. _sendSessionRemindersService.execute(new Date());
      if (processed > 0) {
        logger.info(`[SessionReminderScheduler] processed: ${processed}`);
      }
    } catch (e) {
        logger.error('[SessionReminderScheduler] tick error', { error: e });
    }
  }
}
