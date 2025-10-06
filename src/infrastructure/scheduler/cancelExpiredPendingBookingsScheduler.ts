import { ICancelExpiredPendingBookingsService } from "../../domain/interfaces/ICancelExpiredPendingBookingsService";
import { logger } from '../../utils/logger';

export class CancelExpiredPendingBookingsScheduler {
  private intervalId: ReturnType<typeof setInterval> | null = null;

  constructor(private _cancelExpiredPendingBookingsService: ICancelExpiredPendingBookingsService) {}

  start() {
    this.tick(); // run immediately
    this.intervalId = setInterval(() => this.tick(), 60 * 1000); // every minute
    logger.info('[CancelExpiredPendingBookingsScheduler] started');
  }

  stop() {
    if (this.intervalId) clearInterval(this.intervalId);
    this.intervalId = null;
    logger.info('[CancelExpiredPendingBookingsScheduler] stopped');
  }

  private async tick() {
    try {
      const { cancelled } = await this._cancelExpiredPendingBookingsService.execute();
      if (cancelled > 0) {
        logger.info(`[CancelExpiredPendingBookingsScheduler] cancelled: ${cancelled}`);
      }
    } catch (e) {
      logger.error('[CancelExpiredPendingBookingsScheduler] tick error', { error: e });
    }
  }
}