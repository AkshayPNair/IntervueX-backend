"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CancelExpiredPendingBookingsScheduler = void 0;
const logger_1 = require("../../utils/logger");
class CancelExpiredPendingBookingsScheduler {
    constructor(_cancelExpiredPendingBookingsService) {
        this._cancelExpiredPendingBookingsService = _cancelExpiredPendingBookingsService;
        this.intervalId = null;
    }
    start() {
        this.tick(); // run immediately
        this.intervalId = setInterval(() => this.tick(), 60 * 1000); // every minute
        logger_1.logger.info('[CancelExpiredPendingBookingsScheduler] started');
    }
    stop() {
        if (this.intervalId)
            clearInterval(this.intervalId);
        this.intervalId = null;
        logger_1.logger.info('[CancelExpiredPendingBookingsScheduler] stopped');
    }
    async tick() {
        try {
            const { cancelled } = await this._cancelExpiredPendingBookingsService.execute();
            if (cancelled > 0) {
                logger_1.logger.info(`[CancelExpiredPendingBookingsScheduler] cancelled: ${cancelled}`);
            }
        }
        catch (e) {
            logger_1.logger.error('[CancelExpiredPendingBookingsScheduler] tick error', { error: e });
        }
    }
}
exports.CancelExpiredPendingBookingsScheduler = CancelExpiredPendingBookingsScheduler;
